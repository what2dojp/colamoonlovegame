import { resolveCharacterStatKey } from "../../data/characters.js";

export function getByPath(obj, path) {
  if (!path) return undefined;
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

export function setByPath(obj, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((current, key) => {
    if (current[key] == null || typeof current[key] !== "object") current[key] = {};
    return current[key];
  }, obj);
  target[last] = value;
  return value;
}

export function interpolate(value, ctx) {
  if (typeof value !== "string") return value;
  return value.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const resolved = getByPath(ctx, path.trim());
    return resolved == null ? "" : String(resolved);
  });
}

function evalOp(left, op, right) {
  switch (op) {
    case "eq":
      return left === right;
    case "neq":
      return left !== right;
    case "gt":
      return Number(left) > Number(right);
    case "gte":
      return Number(left) >= Number(right);
    case "lt":
      return Number(left) < Number(right);
    case "lte":
      return Number(left) <= Number(right);
    case "includes":
      return Array.isArray(left) && left.includes(right);
    default:
      return false;
  }
}

export function evalCondition(cond, ctx) {
  if (cond == null || cond === true) return true;
  if (cond === false) return false;
  if (Array.isArray(cond)) return cond.every((item) => evalCondition(item, ctx));
  if (cond.all) return cond.all.every((item) => evalCondition(item, ctx));
  if (cond.any) return cond.any.some((item) => evalCondition(item, ctx));
  if (cond.not) return !evalCondition(cond.not, ctx);
  if (cond.flag) return ctx.flags?.[cond.flag] === (cond.value ?? true);
  if (cond.completed) return (ctx.completedEvents || []).includes(cond.completed);
  if (cond.unresolved) {
    return (ctx.currentSession?.unresolvedEventIds || []).includes(cond.unresolved);
  }
  if (cond.path) {
    let path = interpolate(cond.path, ctx);
    const match = /^characters\.([^.]+)\.([^.]+)$/.exec(path);
    if (match) {
      const officialKey = resolveCharacterStatKey(match[1], match[2]);
      if (!officialKey) return false;
      path = `characters.${match[1]}.${officialKey}`;
    }
    return evalOp(getByPath(ctx, path), cond.op || "eq", interpolate(cond.value, ctx));
  }
  return true;
}
