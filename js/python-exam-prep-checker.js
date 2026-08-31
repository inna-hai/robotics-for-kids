(() => {
  'use strict';

  function normalizeOutput(value) {
    return String(value ?? '')
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim();
  }

  function normalizeCode(value, stripStringContents = false) {
    const source = String(value ?? '');
    let result = '';
    let quote = '';
    let escaped = false;
    let comment = false;
    for (const character of source) {
      if (comment) {
        if (character === '\n') comment = false;
        continue;
      }
      if (quote) {
        if (!stripStringContents) result += character;
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) {
          if (stripStringContents) result += character;
          quote = '';
        }
        continue;
      }
      if (character === '#' ) {
        comment = true;
      } else if (character === '"' || character === "'") {
        quote = character;
        result += character;
      } else if (!/\s/.test(character)) {
        result += character;
      }
    }
    return result;
  }

  function stripStaticallyInactiveCode(value) {
    const lines = String(value || '').replace(/\t/g, '    ').split(/\r?\n/);
    const definitions = [];
    for (let start = 0; start < lines.length; start += 1) {
      const match = lines[start].trim().match(/^(?:async\s+)?def\s+(\w+)\s*\(/);
      if (!match) continue;
      const indent = lines[start].length - lines[start].trimStart().length;
      let end = start + 1;
      while (end < lines.length) {
        const trimmed = lines[end].trim();
        const lineIndent = lines[end].length - lines[end].trimStart().length;
        if (trimmed && lineIndent <= indent) break;
        end += 1;
      }
      definitions.push({ name: match[1], start, end, indent });
    }
    const calledFunctions = new Set(definitions
      .filter(definition => {
        const escapedName = definition.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const outside = lines.filter((_, index) => index < definition.start || index >= definition.end).join('\n');
        return new RegExp(`\\b${escapedName}\\s*\\(`).test(outside);
      })
      .map(definition => definition.name));

    const inactiveParents = [];
    const inactiveHeader = /^(?:class\s+\w+|(?:if|while)\s+(?:False|0|None|not\s+True)\s*:)/;
    const kept = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (!inactiveParents.length) kept.push(line);
        continue;
      }
      const indent = line.length - line.trimStart().length;
      while (inactiveParents.length && indent <= inactiveParents.at(-1)) inactiveParents.pop();
      if (inactiveParents.length) continue;
      const functionMatch = trimmed.match(/^(?:async\s+)?def\s+(\w+)\s*\(/);
      if ((functionMatch && !calledFunctions.has(functionMatch[1])) || inactiveHeader.test(trimmed)) {
        inactiveParents.push(indent);
        continue;
      }
      kept.push(line);
    }
    return kept.join('\n');
  }

  function wrappedAngle(value) {
    return Math.atan2(Math.sin(value), Math.cos(value));
  }

  function turtleTraceMatches(rawPoints, specification) {
    if (!specification || !Array.isArray(rawPoints)) return false;
    const spritePoints = [[5, -9], [0, -7], [-5, -9]];
    const points = [[0, 0], ...rawPoints.filter(point => (
      Array.isArray(point)
      && point.length === 2
      && point.every(Number.isFinite)
      && !spritePoints.some(sprite => Math.abs(point[0] - sprite[0]) < 1e-7 && Math.abs(point[1] - sprite[1]) < 1e-7)
    ))];
    const groups = [];
    for (let index = 1; index < points.length; index += 1) {
      const dx = points[index][0] - points[index - 1][0];
      const dy = points[index][1] - points[index - 1][1];
      const distance = Math.hypot(dx, dy);
      if (distance < 0.01) continue;
      const angle = Math.atan2(dy, dx);
      const current = groups.at(-1);
      if (current && Math.abs(wrappedAngle(angle - current.angle)) <= 0.08) current.distance += distance;
      else groups.push({ angle, distance });
    }
    if (groups.length !== specification.segments) return false;
    const distanceTolerance = Math.max(12, specification.distance * 0.18);
    if (groups.some(group => Math.abs(group.distance - specification.distance) > distanceTolerance)) return false;
    const expectedTurns = specification.turns || Array(groups.length - 1).fill(specification.turn);
    if (expectedTurns.length !== groups.length - 1) return false;
    for (let index = 1; index < groups.length; index += 1) {
      const expectedTurn = expectedTurns[index - 1] * Math.PI / 180;
      if (Math.abs(wrappedAngle(groups[index].angle - groups[index - 1].angle) - expectedTurn) > 0.14) return false;
    }
    return true;
  }

  function missingRequirements(code, checker) {
    const activeCode = stripStaticallyInactiveCode(code);
    const missing = [];
    for (const pattern of checker.requiredPatterns || []) {
      const alternatives = Array.isArray(pattern) ? pattern : [pattern];
      if (!alternatives.some(candidate => {
        const needsStringLiteral = /['"]/.test(candidate);
        return normalizeCode(activeCode, !needsStringLiteral).includes(normalizeCode(candidate, !needsStringLiteral));
      })) {
        missing.push(alternatives.join(' או '));
      }
    }
    const normalizedCode = normalizeCode(activeCode, true);
    for (const [snippet, minimum] of Object.entries(checker.minimumOccurrences || {})) {
      const normalizedSnippet = normalizeCode(snippet);
      const count = normalizedCode.split(normalizedSnippet).length - 1;
      if (count < minimum) missing.push(`${minimum} פעמים: ${snippet.trim()}`);
    }
    return missing;
  }

  function evaluate({ code = '', output = '', checker = {} }) {
    const actual = normalizeOutput(output);
    const expected = normalizeOutput(checker.expectedOutput);

    if (actual !== expected) {
      return {
        status: 'wrong-output',
        title: 'עוד לא בדיוק',
        message: `קיבלנו “${actual || 'פלט ריק'}”, אבל ציפינו ל־“${expected || 'פלט ריק'}”. ${checker.explain || 'עברו שוב על הערכים שורה־שורה.'}`,
      };
    }

    const missing = missingRequirements(String(code), checker);
    if (missing.length) {
      return {
        status: 'almost',
        title: 'כמעט מושלם',
        message: `הפלט נכון, אבל המשימה ביקשה לתרגל דרך מסוימת. בדקו: ${missing.join(', ')}.`,
      };
    }

    return {
      status: 'correct',
      title: 'פתרון נכון!',
      message: checker.success || 'הקוד רץ והפיק בדיוק את התוצאה המבוקשת.',
    };
  }

  function runtimeError(rawError) {
    const error = String(rawError || '');
    if (/OutputLimitError|too much output/i.test(error)) {
      return {
        status: 'output-limit',
        title: 'יותר מדי פלט',
        message: 'עצרנו את הקוד כי הוא הדפיס פלט רב מדי. בדקו שה־print אינו בתוך לולאה ארוכה או אינסופית.',
      };
    }
    if (/TimeLimit|run time limit|execution.*limit/i.test(error)) {
      return {
        status: 'timeout',
        title: 'הלולאה לא נעצרה',
        message: 'עצרנו את הקוד כדי שהלומדה לא תיתקע. בדקו שהמשתנה בתנאי הלולאה משתנה בכל סיבוב.',
      };
    }
    if (/SyntaxError|IndentationError|ParseError|bad input/i.test(error)) {
      return {
        status: 'syntax-error',
        title: 'שגיאת תחביר',
        message: 'זוהי שגיאת תחביר: Python לא הצליח לקרוא את הקוד. בדקו נקודתיים, סוגריים, הזחה וסימני השוואה.',
      };
    }
    if (/EOFError|input/i.test(error)) {
      return {
        status: 'input-error',
        title: 'חסר קלט',
        message: 'הקוד ביקש יותר ערכי input מאלה שהאתגר סיפק. בדקו כמה פעמים קראתם ל־input().',
      };
    }
    if (/NameError/i.test(error)) {
      return {
        status: 'name-error',
        title: 'שם לא מוכר',
        message: 'השתמשתם בשם משתנה שעדיין לא הוגדר. בדקו גם אותיות גדולות וקטנות.',
      };
    }
    if (/IndexError/i.test(error)) {
      return {
        status: 'index-error',
        title: 'אינדקס מחוץ לטווח',
        message: 'ניסיתם לגשת למקום שאינו קיים במחרוזת. האינדקס האחרון הוא len(text) - 1.',
      };
    }
    return {
      status: 'runtime-error',
      title: 'הקוד נעצר עם שגיאה',
      message: 'קראו את הודעת השגיאה בפלט ובדקו את השורה שמצוינת בה.',
    };
  }

  window.PythonExamChecker = Object.freeze({
    normalizeOutput,
    normalizeCode,
    stripStaticallyInactiveCode,
    turtleTraceMatches,
    evaluate,
    runtimeError,
  });
})();
