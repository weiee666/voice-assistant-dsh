import { createHmac, randomUUID } from "node:crypto";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
//#region ../../../vendor/cosmokit/src/misc.ts
/** Return true when a value is `null` or `undefined`. */
function isNullable(value) {
	return value === null || value === void 0;
}
/** Return true for non-array object values. */
function isPlainObject(data) {
	return data && typeof data === "object" && !Array.isArray(data);
}
/** Filter object entries and return a new object. */
function filterKeys(object, filter) {
	return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
/** Map object values while preserving the original key set. */
function mapValues(object, transform) {
	return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
/** Pick selected keys from an object, optionally including `undefined` values. */
function pick(source, keys, forced) {
	if (!keys) return { ...source };
	const result = {};
	for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
	return result;
}
//#endregion
//#region ../../../vendor/cosmokit/src/types.ts
/** Test values using `instanceof` with a `toStringTag` fallback. */
function is(type, value) {
	if (arguments.length === 1) return (value) => is(type, value);
	return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
	return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
	return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
let Binary;
(function(_Binary) {
	_Binary.is = isArrayBufferLike;
	_Binary.isSource = isArrayBufferSource;
	function fromSource(source) {
		if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
		else return source;
	}
	_Binary.fromSource = fromSource;
	function toBase64(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
		let binary = "";
		const bytes = new Uint8Array(source);
		for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary);
	}
	_Binary.toBase64 = toBase64;
	function fromBase64(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
		return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
	}
	_Binary.fromBase64 = fromBase64;
	function toHex(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
		return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
	}
	_Binary.toHex = toHex;
	function fromHex(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
		const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
		const buffer = [];
		for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
		return Uint8Array.from(buffer).buffer;
	}
	_Binary.fromHex = fromHex;
})(Binary || (Binary = {}));
Binary.fromBase64;
Binary.toBase64;
Binary.fromHex;
Binary.toHex;
/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
function clone(source, refs = /* @__PURE__ */ new Map()) {
	if (!source || typeof source !== "object") return source;
	if (is("Date", source)) return new Date(source.valueOf());
	if (is("RegExp", source)) return new RegExp(source.source, source.flags);
	if (isArrayBufferLike(source)) return source.slice(0);
	if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
	const cached = refs.get(source);
	if (cached) return cached;
	if (Array.isArray(source)) {
		const result = [];
		refs.set(source, result);
		source.forEach((value, index) => {
			result[index] = Reflect.apply(clone, null, [value, refs]);
		});
		return result;
	}
	const result = Object.create(Object.getPrototypeOf(source));
	refs.set(source, result);
	for (const key of Reflect.ownKeys(source)) {
		const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
		if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
		Reflect.defineProperty(result, key, descriptor);
	}
	return result;
}
/** Deeply compare arrays, dates, regexps, buffers, and plain object fields. */
function deepEqual(a, b, strict) {
	if (a === b) return true;
	if (!strict && isNullable(a) && isNullable(b)) return true;
	if (typeof a !== typeof b) return false;
	if (typeof a !== "object") return false;
	if (!a || !b) return false;
	function check(test, then) {
		return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
	}
	return check(Array.isArray, (a, b) => a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
		if (a.byteLength !== b.byteLength) return false;
		const viewA = new Uint8Array(a);
		const viewB = new Uint8Array(b);
		for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
		return true;
	}) ?? Object.keys({
		...a,
		...b
	}).every((key) => deepEqual(a[key], b[key], strict));
}
//#endregion
//#region ../../../vendor/cosmokit/src/time.ts
let Time;
(function(_Time) {
	_Time.millisecond = 1;
	const second = _Time.second = 1e3;
	const minute = _Time.minute = second * 60;
	const hour = _Time.hour = minute * 60;
	const day = _Time.day = hour * 24;
	const week = _Time.week = day * 7;
	let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
	function setTimezoneOffset(offset) {
		timezoneOffset = offset;
	}
	_Time.setTimezoneOffset = setTimezoneOffset;
	function getTimezoneOffset() {
		return timezoneOffset;
	}
	_Time.getTimezoneOffset = getTimezoneOffset;
	function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
		if (typeof date === "number") date = new Date(date);
		if (offset === void 0) offset = timezoneOffset;
		return Math.floor((date.valueOf() / minute - offset) / 1440);
	}
	_Time.getDateNumber = getDateNumber;
	function fromDateNumber(value, offset) {
		const date = new Date(value * day);
		if (offset === void 0) offset = timezoneOffset;
		return new Date(+date + offset * minute);
	}
	_Time.fromDateNumber = fromDateNumber;
	const numeric = /\d+(?:\.\d+)?/.source;
	const timeRegExp = new RegExp(`^${[
		"w(?:eek(?:s)?)?",
		"d(?:ay(?:s)?)?",
		"h(?:our(?:s)?)?",
		"m(?:in(?:ute)?(?:s)?)?",
		"s(?:ec(?:ond)?(?:s)?)?"
	].map((unit) => `(${numeric}${unit})?`).join("")}$`);
	function parseTime(source) {
		const capture = timeRegExp.exec(source);
		if (!capture) return 0;
		return (parseFloat(capture[1]) * week || 0) + (parseFloat(capture[2]) * day || 0) + (parseFloat(capture[3]) * hour || 0) + (parseFloat(capture[4]) * minute || 0) + (parseFloat(capture[5]) * second || 0);
	}
	_Time.parseTime = parseTime;
	function parseDate(date) {
		const parsed = parseTime(date);
		if (parsed) date = Date.now() + parsed;
		else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
		else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
		return date ? new Date(date) : /* @__PURE__ */ new Date();
	}
	_Time.parseDate = parseDate;
	function format(ms) {
		const abs = Math.abs(ms);
		if (abs >= day - hour / 2) return Math.round(ms / day) + "d";
		else if (abs >= hour - minute / 2) return Math.round(ms / hour) + "h";
		else if (abs >= minute - second / 2) return Math.round(ms / minute) + "m";
		else if (abs >= second) return Math.round(ms / second) + "s";
		return ms + "ms";
	}
	_Time.format = format;
	function toDigits(source, length = 2) {
		return source.toString().padStart(length, "0");
	}
	_Time.toDigits = toDigits;
	function template(template, time = /* @__PURE__ */ new Date()) {
		return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
	}
	_Time.template = template;
})(Time || (Time = {}));
//#endregion
//#region ../../../vendor/schemastery/src/index.ts
const kSchema = Symbol.for("schemastery");
const kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
	options;
	name = "ValidationError";
	constructor(message, options) {
		let prefix = "$";
		for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
		else if (typeof segment === "number") prefix += "[" + segment + "]";
		else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
		if (prefix.startsWith(".")) prefix = prefix.slice(1);
		super((prefix === "$" ? "" : `${prefix} `) + message);
		this.options = options;
	}
	static is(error) {
		return !!error?.[kValidationError];
	}
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
const Schema = function(options) {
	const schema = function(data, options = {}) {
		return Schema.resolve(data, schema, options)[0];
	};
	if (options.refs) {
		const refs = mapValues(options.refs, (options) => new Schema(options));
		const getRef = (uid) => refs[uid];
		for (const key in refs) {
			const options = refs[key];
			options.sKey = getRef(options.sKey);
			options.inner = getRef(options.inner);
			options.list = options.list && options.list.map(getRef);
			options.dict = options.dict && mapValues(options.dict, getRef);
		}
		return refs[options.uid];
	}
	Object.assign(schema, options);
	if (typeof schema.callback === "string") try {
		schema.callback = new Function("return " + schema.callback)();
	} catch {}
	Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
	Object.setPrototypeOf(schema, Schema.prototype);
	schema.meta ||= {};
	schema.toString = schema.toString.bind(schema);
	return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
	return {
		version: 1,
		vendor: "schemastery",
		validate: (value) => {
			try {
				return { value: Schema.resolve(value, this, {})[0] };
			} catch (error) {
				if (ValidationError.is(error)) return { issues: [{
					message: error.message,
					path: error.options.path
				}] };
				throw error;
			}
		}
	};
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
	if (globalThis.__schemastery_refs__) {
		globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
		return this.uid;
	}
	globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
	globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
	const result = {
		uid: this.uid,
		refs: globalThis.__schemastery_refs__
	};
	globalThis.__schemastery_refs__ = void 0;
	return result;
};
Schema.prototype.set = function set(key, value) {
	this.dict[key] = value;
	return this;
};
Schema.prototype.push = function push(value) {
	this.list.push(value);
	return this;
};
function mergeDesc(original, messages) {
	const result = typeof original === "string" ? { "": original } : { ...original };
	for (const locale in messages) {
		const value = messages[locale];
		if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
		else if (typeof value === "string") result[locale] = value;
	}
	return result;
}
function getInner(value) {
	return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
	return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
	const schema = Schema(this);
	const desc = mergeDesc(schema.meta.description, messages);
	if (Object.keys(desc).length) schema.meta.description = desc;
	if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
		return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
	});
	if (schema.list) schema.list = schema.list.map((inner, index) => {
		return inner.i18n(mapValues(messages, (data = {}) => {
			if (Array.isArray(getInner(data))) return getInner(data)[index];
			if (Array.isArray(data)) return data[index];
			return extractKeys(data);
		}));
	});
	if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
		if (getInner(data)) return getInner(data);
		return extractKeys(data);
	}));
	if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
	return schema;
};
Schema.prototype.extra = function extra(key, value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
};
for (const key of [
	"required",
	"disabled",
	"collapse",
	"hidden",
	"loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
Schema.prototype.deprecated = function deprecated() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "deprecated",
		type: "danger"
	});
	return schema;
};
Schema.prototype.experimental = function experimental() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "experimental",
		type: "warning"
	});
	return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
	const schema = Schema(this);
	const pattern = pick(regexp, ["source", "flags"]);
	schema.meta = {
		...schema.meta,
		pattern
	};
	return schema;
};
Schema.prototype.simplify = function simplify(value) {
	if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
	if (isNullable(value)) return value;
	if (this.type === "object" || this.type === "dict") {
		const result = {};
		for (const key in value) {
			const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
			if (this.type === "dict" || !isNullable(item)) result[key] = item;
		}
		if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
		return result;
	} else if (this.type === "array" || this.type === "tuple") {
		const result = [];
		value.forEach((value, index) => {
			const schema = this.type === "array" ? this.inner : this.list[index];
			const item = schema ? schema.simplify(value) : value;
			result.push(item);
		});
		return result;
	} else if (this.type === "intersect") {
		const result = {};
		for (const item of this.list) Object.assign(result, item.simplify(value));
		return result;
	} else if (this.type === "union") for (const schema of this.list) try {
		Schema.resolve(value, schema, {});
		return schema.simplify(value);
	} catch {}
	return value;
};
Schema.prototype.toString = function toString(inline) {
	return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		role,
		extra
	};
	return schema;
};
for (const key of [
	"default",
	"link",
	"comment",
	"description",
	"max",
	"min",
	"step"
]) Object.assign(Schema.prototype, { [key](value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
const resolvers = {};
Schema.extend = function extend(type, resolve) {
	resolvers[type] = resolve;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
	if (!schema) return [data];
	if (options.ignore?.(data, schema)) return [data];
	if (isNullable(data) && schema.type !== "lazy") {
		if (schema.meta.required) throw new ValidationError(`missing required value`, options);
		let current = schema;
		let fallback = schema.meta.default;
		while (current?.type === "intersect" && isNullable(fallback)) {
			current = current.list[0];
			fallback = current?.meta.default;
		}
		if (isNullable(fallback)) return [data];
		data = clone(fallback);
	}
	const callback = resolvers[schema.type];
	if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
	try {
		return callback(data, schema, options, strict);
	} catch (error) {
		if (!schema.meta.loose) throw error;
		return [schema.meta.default];
	}
};
Schema.from = function from(source) {
	if (isNullable(source)) return Schema.any();
	else if ([
		"string",
		"number",
		"boolean"
	].includes(typeof source)) return Schema.const(source).required();
	else if (source[kSchema]) return source;
	else if (typeof source === "function") switch (source) {
		case String: return Schema.string().required();
		case Number: return Schema.number().required();
		case Boolean: return Schema.boolean().required();
		case Function: return Schema.function().required();
		default: return Schema.is(source).required();
	}
	else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
	const toJSON = () => {
		if (!schema.inner[kSchema]) {
			schema.inner = schema.builder();
			schema.inner.meta = {
				...schema.meta,
				...schema.inner.meta
			};
		}
		return schema.inner.toJSON();
	};
	const schema = new Schema({
		type: "lazy",
		builder,
		inner: { toJSON }
	});
	return schema;
};
Schema.natural = function natural() {
	return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
	return Schema.number().step(.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
	return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
		const date = new Date(value);
		if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
		return date;
	}, true)]);
};
Schema.regExp = function regExp(flag = "") {
	return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
		try {
			return new RegExp(value, flag);
		} catch (e) {
			throw new ValidationError(e.message, options);
		}
	}, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
	return Schema.union([
		Schema.is(ArrayBuffer),
		Schema.is(SharedArrayBuffer),
		Schema.transform(Schema.any(), (value, options) => {
			if (Binary.isSource(value)) return Binary.fromSource(value);
			throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
		}, true),
		...encoding ? [Schema.transform(Schema.string(), (value, options) => {
			try {
				return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
			} catch (e) {
				throw new ValidationError(e.message, options);
			}
		}, true)] : []
	]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
	if (!schema.inner[kSchema]) {
		schema.inner = schema.builder();
		schema.inner.meta = {
			...schema.meta,
			...schema.inner.meta
		};
	}
	return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
	return [data];
});
Schema.extend("never", (data, _, options) => {
	throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
	if (deepEqual(data, value)) return [value];
	throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
	const { max = Infinity, min = -Infinity } = meta;
	if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
	if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
	if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
	if (meta.pattern) {
		const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
		if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
	}
	checkWithinRange(data.length, meta, "string length", options);
	return [data];
});
function decimalShift(data, digits) {
	const str = data.toString();
	if (str.includes("e")) return data * Math.pow(10, digits);
	const index = str.indexOf(".");
	if (index === -1) return data * Math.pow(10, digits);
	const frac = str.slice(index + 1);
	const integer = str.slice(0, index);
	if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
	return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
	step = Math.abs(step);
	if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
	const index = step.toString().indexOf(".");
	const digits = step.toString().slice(index + 1).length;
	return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
	if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
	checkWithinRange(data, meta, "number", options);
	const { step } = meta;
	if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
	return [data];
});
Schema.extend("boolean", (data, _, options) => {
	if (typeof data === "boolean") return [data];
	throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
	let value = 0, keys = [];
	if (typeof data === "number") {
		value = data;
		for (const key in bits) if (data & bits[key]) keys.push(key);
	} else if (Array.isArray(data)) {
		keys = data;
		for (const key of keys) {
			if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
			if (key in bits) value |= bits[key];
		}
	} else throw new ValidationError(`expected number or array but got ${data}`, options);
	if (value === meta.default) return [value];
	return [value, keys];
});
Schema.extend("function", (data, _, options) => {
	if (typeof data === "function") return [data];
	throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
	if (typeof constructor === "function") {
		if (data instanceof constructor) return [data];
		throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
	} else {
		if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
		let prototype = Object.getPrototypeOf(data);
		while (prototype) {
			if (prototype.constructor?.name === constructor) return [data];
			prototype = Object.getPrototypeOf(prototype);
		}
		throw new ValidationError(`expected ${constructor} but got ${data}`, options);
	}
});
function property(data, key, schema, options) {
	try {
		const [value, adapted] = Schema.resolve(data[key], schema, {
			...options,
			path: [...options.path || [], key]
		});
		if (adapted !== void 0) data[key] = adapted;
		return value;
	} catch (e) {
		if (!options?.autofix) throw e;
		delete data[key];
		return schema.meta.default;
	}
}
Schema.extend("array", (data, { inner, meta }, options) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
	return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in data) {
		let rKey;
		try {
			rKey = Schema.resolve(key, sKey, options)[0];
		} catch (error) {
			if (strict) continue;
			throw error;
		}
		result[rKey] = property(data, key, inner, options);
		data[rKey] = data[key];
		if (key !== rKey) delete data[key];
	}
	return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	const result = list.map((inner, index) => property(data, index, inner, options));
	if (strict) return [result];
	result.push(...data.slice(list.length));
	return [result];
});
function merge(result, data) {
	for (const key in data) {
		if (key in result) continue;
		result[key] = data[key];
	}
}
Schema.extend("object", (data, { dict }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in dict) {
		const value = property(data, key, dict[key], options);
		if (!isNullable(value) || key in data) result[key] = value;
	}
	if (!strict) merge(result, data);
	return [result];
});
Schema.extend("union", (data, { list, toString }, options, strict) => {
	const messages = [];
	for (const inner of list) try {
		return Schema.resolve(data, inner, options, strict);
	} catch (error) {
		messages.push(error);
	}
	throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString }, options, strict) => {
	if (!list.length) return [data];
	let result;
	for (const inner of list) {
		const value = Schema.resolve(data, inner, options, true)[0];
		if (isNullable(value)) continue;
		if (isNullable(result)) result = value;
		else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		else if (typeof value === "object") merge(result ??= {}, value);
		else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
	}
	if (!strict && isPlainObject(data)) merge(result, data);
	return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
	const [result, adapted = data] = Schema.resolve(data, inner, options, true);
	if (preserve) return [callback(result)];
	else return [callback(result), callback(adapted)];
});
const formatters = {};
function defineMethod(name, keys, format) {
	formatters[name] = format;
	Object.assign(Schema, { [name](...args) {
		const schema = new Schema({ type: name });
		keys.forEach((key, index) => {
			switch (key) {
				case "sKey":
					schema.sKey = args[index] ?? Schema.string();
					break;
				case "inner":
					schema.inner = Schema.from(args[index]);
					break;
				case "list":
					schema.list = args[index].map(Schema.from);
					break;
				case "dict":
					schema.dict = mapValues(args[index], Schema.from);
					break;
				case "bits":
					schema.bits = {};
					for (const key in args[index]) {
						if (typeof args[index][key] !== "number") continue;
						schema.bits[key] = args[index][key];
					}
					break;
				case "callback": {
					const callback = schema.callback = args[index];
					callback["toJSON"] ||= () => callback.toString();
					break;
				}
				case "constructor": {
					const constructor = schema.constructor = args[index];
					if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
					break;
				}
				default: schema[key] = args[index];
			}
		});
		if (name === "object" || name === "dict") schema.meta.default = {};
		else if (name === "array" || name === "tuple") schema.meta.default = [];
		else if (name === "bitset") schema.meta.default = 0;
		return schema;
	} });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
	if (typeof constructor === "function") return constructor.name;
	else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
	if (Object.keys(dict).length === 0) return "{}";
	return `{ ${Object.entries(dict).map(([key, inner]) => {
		return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
	}).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
	const result = list.map(({ toString: format }) => format()).join(" | ");
	return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
	return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
	"inner",
	"callback",
	"preserve"
], ({ inner }, isInner) => inner.toString(isInner));
//#endregion
//#region lib/types/settings-contract.js
/** Settings values shared by the WeChat Assistant Host and browser faces. */
/** Durable settings namespace owned by the WeChat Assistant. */
const A2A_ASSISTANT_SETTINGS_NAMESPACE = "ui-a2a-assistant";
//#endregion
//#region lib/types/index.js
/** Host transport for the WeChat Assistant's voice services. */
/** Stable Cordis plugin name. */
const name = "client-ui-a2a-assistant";
/** Host services needed to create a secret-backed Realtime call. */
const inject = ["credentials", "webServer"];
const REALTIME_PATH = "/api/wechat-assistant/openai/realtime";
const SECRETARY_TTS_PATH = "/api/wechat-assistant/tts";
const SECRETARY_ASR_PATH = "/api/wechat-assistant/asr";
const ASSISTANT_MESSAGES_PATH = "/api/wechat-assistant/messages";
const ASSISTANT_REPLIES_PATH = "/api/wechat-assistant/replies";
const ASSISTANT_STATE_PATH = "/api/wechat-assistant/state";
const MAX_TTS_TEXT_LENGTH = 4e3;
const MAX_MESSAGE_TEXT_LENGTH = 8e3;
const MAX_SESSION_ID_LENGTH = 200;
const MAX_ASR_BYTES = 2 * 1024 * 1024;
const MAX_BRIDGE_MESSAGES = 500;
const Config = Schema.object({
	apiKeyEnv: Schema.string().role("credential-ref").default("OPENAI_API_KEY"),
	baseURL: Schema.string().default("https://api.openai.com/v1"),
	model: Schema.string().default("gpt-realtime-2.1"),
	voice: Schema.string().default("marin"),
	transcriptionModel: Schema.string().default("gpt-4o-mini-transcribe"),
	instructions: Schema.string().default("You are a concise, warm personal assistant. Speak naturally and support Mandarin-English code-switching."),
	voiceSilenceMs: Schema.natural().min(250).default(1500),
	minimaxApiKeyEnv: Schema.string().role("credential-ref").default("MINIMAX_API_KEY"),
	minimaxBaseURL: Schema.string().default("https://api.minimaxi.com/v1"),
	minimaxModel: Schema.string().default("speech-2.8-turbo"),
	minimaxVoice: Schema.string().default("male-qn-qingse"),
	minimaxFormat: Schema.string().default("mp3"),
	aliyunNlsTokenEnv: Schema.string().role("credential-ref").default("ALIYUN_NLS_TOKEN"),
	aliyunAccessKeyIdEnv: Schema.string().role("credential-ref").default("ALIYUN_AK_ID"),
	aliyunAccessKeySecretEnv: Schema.string().role("credential-ref").default("ALIYUN_AK_SECRET"),
	aliyunTokenRegionId: Schema.string().default("cn-shanghai"),
	aliyunTokenURL: Schema.string().default("https://nls-meta.cn-shanghai.aliyuncs.com/"),
	aliyunNlsAppKey: Schema.string().default(""),
	aliyunAsrURL: Schema.string().default("https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/asr"),
	aliyunAsrFormat: Schema.string().default("pcm"),
	aliyunAsrSampleRate: Schema.natural().min(8e3).default(16e3),
	publicDashboardUrl: Schema.string().default(""),
	bridgeDeviceName: Schema.string().default("local-harness"),
	bridgePollIntervalMs: Schema.natural().min(500).default(1500),
	telegramBotTokenEnv: Schema.string().role("credential-ref").default("TELEGRAM_BOT_TOKEN"),
	telegramAllowedUserIds: Schema.string().default("")
});
function realtimeSession(config) {
	return {
		type: "realtime",
		model: config.model,
		output_modalities: ["audio"],
		instructions: config.instructions,
		audio: {
			input: {
				transcription: { model: config.transcriptionModel },
				turn_detection: {
					type: "server_vad",
					threshold: .32,
					prefix_padding_ms: 900,
					silence_duration_ms: config.voiceSilenceMs,
					create_response: false,
					interrupt_response: false
				}
			},
			output: { voice: config.voice }
		}
	};
}
/** Mint a short-lived OpenAI Realtime client secret.
* @param apiKey - server-resolved OpenAI API key.
* @param config - validated Realtime settings.
* @param fetcher - HTTP implementation, replaceable by focused tests.
* @returns the upstream client-secret response.
*/
async function createRealtimeClientSecret(apiKey, config, fetcher = fetch) {
	return fetcher(`${config.baseURL.replace(/\/$/u, "")}/realtime/client_secrets`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${apiKey}`,
			"content-type": "application/json"
		},
		body: JSON.stringify({ session: realtimeSession(config) })
	});
}
/** Request speech audio from MiniMax's T2A endpoint.
* @param apiKey - server-resolved MiniMax API key.
* @param text - Text to synthesize.
* @param config - validated MiniMax settings.
* @param fetcher - HTTP implementation, replaceable by focused tests.
* @returns an audio response decoded from the upstream hex payload.
*/
async function createMiniMaxSpeech(apiKey, text, config, fetcher = fetch) {
	const response = await fetcher(`${config.minimaxBaseURL.replace(/\/$/u, "")}/t2a_v2`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${apiKey}`,
			"content-type": "application/json"
		},
		body: JSON.stringify({
			model: config.minimaxModel,
			text,
			stream: false,
			language_boost: "auto",
			output_format: "hex",
			voice_setting: {
				voice_id: config.minimaxVoice,
				speed: 1,
				vol: 1,
				pitch: 0
			},
			audio_setting: {
				sample_rate: 32e3,
				bitrate: 128e3,
				format: config.minimaxFormat,
				channel: 1
			}
		})
	});
	const body = await response.text();
	if (!response.ok) return new Response(body, {
		status: response.status,
		headers: { "content-type": response.headers.get("content-type") ?? "application/json; charset=utf-8" }
	});
	const audio = readMiniMaxAudio(body);
	if (audio === void 0) return new Response(JSON.stringify({ error: "MiniMax returned an invalid TTS response" }), {
		status: 502,
		headers: { "content-type": "application/json; charset=utf-8" }
	});
	const audioBody = new ArrayBuffer(audio.byteLength);
	new Uint8Array(audioBody).set(audio);
	return new Response(audioBody, {
		status: 200,
		headers: { "content-type": contentTypeForAudioFormat(config.minimaxFormat) }
	});
}
/** Request a short-sentence transcript from Aliyun Intelligent Speech Interaction.
* @param token - server-resolved Aliyun NLS token.
* @param audio - PCM audio bytes captured by the browser.
* @param config - validated Aliyun ASR settings.
* @param fetcher - HTTP implementation, replaceable by focused tests.
* @returns the Aliyun ASR response.
*/
async function createAliyunAsrTranscript(token, audio, config, fetcher = fetch) {
	const url = new URL(config.aliyunAsrURL);
	url.searchParams.set("appkey", config.aliyunNlsAppKey);
	url.searchParams.set("format", config.aliyunAsrFormat);
	url.searchParams.set("sample_rate", String(config.aliyunAsrSampleRate));
	url.searchParams.set("enable_punctuation_prediction", "true");
	url.searchParams.set("enable_inverse_text_normalization", "true");
	url.searchParams.set("enable_voice_detection", "true");
	return fetcher(url, {
		method: "POST",
		headers: {
			"X-NLS-Token": token,
			"content-type": "application/octet-stream"
		},
		body: bodyBuffer(audio)
	});
}
/** Create an Aliyun NLS token with POP OpenAPI signing.
* @param accessKeyId - Aliyun AccessKey ID.
* @param accessKeySecret - Aliyun AccessKey Secret.
* @param config - validated Aliyun token settings.
* @param fetcher - HTTP implementation, replaceable by focused tests.
* @returns the temporary NLS token and expiry.
*/
async function createAliyunNlsToken(accessKeyId, accessKeySecret, config, fetcher = fetch) {
	const parameters = {
		AccessKeyId: accessKeyId,
		Action: "CreateToken",
		Format: "JSON",
		RegionId: config.aliyunTokenRegionId,
		SignatureMethod: "HMAC-SHA1",
		SignatureNonce: randomUUID(),
		SignatureVersion: "1.0",
		Timestamp: (/* @__PURE__ */ new Date()).toISOString().replace(/\.\d{3}Z$/u, "Z"),
		Version: "2019-02-28"
	};
	const stringToSign = `GET&%2F&${percentEncode(canonicalQuery(parameters))}`;
	parameters.Signature = createHmac("sha1", `${accessKeySecret}&`).update(stringToSign).digest("base64");
	const url = new URL(config.aliyunTokenURL);
	for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
	const response = await fetcher(url);
	const body = await response.text();
	if (!response.ok) throw new Error(body.trim() || `Aliyun CreateToken failed (${String(response.status)})`);
	return readAliyunToken(body);
}
function readClientSecret(body) {
	try {
		const parsed = JSON.parse(body);
		return typeof parsed.value === "string" && parsed.value !== "" ? parsed.value : void 0;
	} catch {
		return;
	}
}
function readMiniMaxAudio(body) {
	try {
		const parsed = JSON.parse(body);
		const statusCode = parsed.base_resp?.status_code;
		if (statusCode !== void 0 && statusCode !== 0) return void 0;
		return typeof parsed.data?.audio === "string" ? hexToBytes(parsed.data.audio) : void 0;
	} catch {
		return;
	}
}
function hexToBytes(hex) {
	if (hex.length % 2 !== 0 || !/^[\da-f]*$/iu.test(hex)) return void 0;
	const bytes = new Uint8Array(hex.length / 2);
	for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
	return bytes;
}
function contentTypeForAudioFormat(format) {
	switch (format) {
		case "mp3": return "audio/mpeg";
		case "wav": return "audio/wav";
		case "flac": return "audio/flac";
		case "pcm": return "audio/L16";
		default: return "application/octet-stream";
	}
}
function percentEncode(value) {
	return encodeURIComponent(value).replace(/\+/gu, "%20").replace(/\*/gu, "%2A").replace(/%7E/gu, "~");
}
function canonicalQuery(parameters) {
	return Object.keys(parameters).sort().map((key) => `${percentEncode(key)}=${percentEncode(parameters[key] ?? "")}`).join("&");
}
function readAliyunToken(body) {
	const parsed = JSON.parse(body);
	const id = parsed.Token?.Id;
	const expireTime = parsed.Token?.ExpireTime;
	if (typeof id !== "string" || id === "" || typeof expireTime !== "number") throw new Error("Aliyun CreateToken returned an invalid token response");
	return {
		id,
		expireTime
	};
}
function bodyBuffer(bytes) {
	const body = new ArrayBuffer(bytes.byteLength);
	new Uint8Array(body).set(bytes);
	return body;
}
function answer(res, status, contentType, body) {
	res.writeHead(status, {
		"content-type": contentType,
		"cache-control": "no-store"
	});
	res.end(body);
}
function answerBytes(res, status, contentType, body) {
	res.writeHead(status, {
		"content-type": contentType,
		"cache-control": "no-store"
	});
	res.end(body);
}
async function readBody(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
	return Buffer.concat(chunks).toString("utf8");
}
function readAsrAudio(body) {
	try {
		const parsed = JSON.parse(body);
		if (typeof parsed.audio !== "string" || parsed.audio === "") return void 0;
		const bytes = Buffer.from(parsed.audio, "base64");
		return bytes.byteLength > MAX_ASR_BYTES ? void 0 : new Uint8Array(bytes);
	} catch {
		return;
	}
}
function readTtsText(body) {
	try {
		const parsed = JSON.parse(body);
		if (typeof parsed.text !== "string") return void 0;
		const text = parsed.text.trim();
		return text === "" || text.length > MAX_TTS_TEXT_LENGTH ? void 0 : text;
	} catch {
		return;
	}
}
function readJsonBody(body) {
	try {
		return JSON.parse(body);
	} catch {
		return;
	}
}
function readConversation(value) {
	return value === "self" || value === "teacher" || value === "claude" || value === "chatgpt" ? value : void 0;
}
function readMessageRole(value) {
	return value === "user" || value === "assistant" || value === "system" ? value : void 0;
}
function readMessageText(value) {
	if (typeof value !== "string") return void 0;
	const text = value.trim();
	return text === "" || text.length > MAX_MESSAGE_TEXT_LENGTH ? void 0 : text;
}
function readNumber(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function parseAllowedTelegramUsers(raw) {
	const ids = raw.split(",").map((part) => Number.parseInt(part.trim(), 10)).filter(Number.isFinite);
	return new Set(ids);
}
function isDashboardCommand(text) {
	const normalized = text.trim().toLowerCase();
	return normalized === "看板" || normalized === "/dashboard" || normalized === "dashboard";
}
function dashboardReply(settings) {
	const url = settings.publicDashboardUrl.trim();
	return url === "" ? "公网看板地址还没有配置。请先在微信助手设置里填写 Vercel 生产地址。" : `看板地址：${url}`;
}
function createBridgeStore() {
	let nextMessageId = 1;
	let secretarySessionId;
	const messages = [];
	const append = (message) => {
		const stored = {
			...message,
			id: String(nextMessageId),
			time: message.time ?? Date.now()
		};
		messages.push(stored);
		if (messages.length > MAX_BRIDGE_MESSAGES) messages.splice(0, messages.length - MAX_BRIDGE_MESSAGES);
		nextMessageId += 1;
		return stored;
	};
	return {
		append,
		list: () => messages,
		find: (id) => messages.find((message) => message.id === id),
		readState: () => ({ secretarySessionId }),
		bindSecretarySession: (value) => {
			secretarySessionId = value;
		}
	};
}
function readSessionId(value) {
	if (typeof value !== "string") return void 0;
	const sessionId = value.trim();
	return sessionId === "" || sessionId.length > MAX_SESSION_ID_LENGTH ? void 0 : sessionId;
}
async function resolveOptionalCredential(ctx, ref) {
	return (await ctx.credentials.resolve(credentialRef(ref)))?.value;
}
async function telegramRequest(token, method, body) {
	const init = body === void 0 ? { method: "GET" } : {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body)
	};
	const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, init);
	if (!response.ok) throw new Error(`Telegram ${method} failed with ${response.status}`);
	return response.json();
}
async function sendTelegramMessage(token, chatId, text) {
	await telegramRequest(token, "sendMessage", {
		chat_id: chatId,
		text
	});
}
async function createSecretarySpeech(ctx, text, config) {
	const credential = await ctx.credentials.resolve(credentialRef(config.minimaxApiKeyEnv));
	if (credential === void 0) return new Response(JSON.stringify({ error: `${config.minimaxApiKeyEnv} is not configured` }), {
		status: 503,
		headers: { "content-type": "application/json; charset=utf-8" }
	});
	return createMiniMaxSpeech(credential.value, text, config);
}
async function createSecretaryAsr(audio, config, readToken) {
	if (config.aliyunNlsAppKey.trim() === "") return new Response(JSON.stringify({ error: "Aliyun NLS AppKey is not configured" }), {
		status: 503,
		headers: { "content-type": "application/json; charset=utf-8" }
	});
	const token = await readToken(config);
	if (token === void 0) return new Response(JSON.stringify({ error: "Aliyun AccessKey or NLS Token is not configured" }), {
		status: 503,
		headers: { "content-type": "application/json; charset=utf-8" }
	});
	return createAliyunAsrTranscript(token, audio, config);
}
/** Register the voice service routes.
* @param ctx - host context carrying credentials and the Web route registry.
* @param config - validated voice settings.
*/
function apply(ctx, config) {
	let current = () => config;
	const bridge = createBridgeStore();
	let telegramOffset = 0;
	let telegramPolling = false;
	let aliyunTokenCache;
	const readAliyunNlsToken = async (settings) => {
		const nowSeconds = Math.floor(Date.now() / 1e3);
		if (aliyunTokenCache !== void 0 && aliyunTokenCache.expireTime - nowSeconds > 300) return aliyunTokenCache.id;
		const accessKeyId = await resolveOptionalCredential(ctx, settings.aliyunAccessKeyIdEnv);
		const accessKeySecret = await resolveOptionalCredential(ctx, settings.aliyunAccessKeySecretEnv);
		if (accessKeyId !== void 0 && accessKeySecret !== void 0) {
			aliyunTokenCache = await createAliyunNlsToken(accessKeyId, accessKeySecret, settings);
			return aliyunTokenCache.id;
		}
		return resolveOptionalCredential(ctx, settings.aliyunNlsTokenEnv);
	};
	installSettingsSection(ctx, settingsNamespace(A2A_ASSISTANT_SETTINGS_NAMESPACE), Config, config, {
		setSource: (source) => {
			current = source;
		},
		onChange: () => {}
	});
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: ASSISTANT_MESSAGES_PATH,
		handler: async (req, res) => {
			if (req.method === "GET") {
				answer(res, 200, "application/json; charset=utf-8", JSON.stringify({ messages: bridge.list() }));
				return;
			}
			if (req.method !== "POST") {
				answer(res, 405, "application/json; charset=utf-8", JSON.stringify({ error: "Method not allowed" }));
				return;
			}
			const parsed = readJsonBody(await readBody(req));
			const conversation = readConversation(parsed?.conversation);
			const role = readMessageRole(parsed?.role);
			const text = readMessageText(parsed?.text);
			if (conversation === void 0 || role === void 0 || text === void 0) {
				answer(res, 400, "application/json; charset=utf-8", JSON.stringify({ error: "conversation, role and text are required" }));
				return;
			}
			const status = conversation === "self" && role === "user" ? "pending" : "handled";
			const message = bridge.append({
				conversation,
				role,
				text,
				source: "web",
				status
			});
			answer(res, 200, "application/json; charset=utf-8", JSON.stringify({ message }));
		}
	}), "ui-a2a-assistant: bridge message route");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: ASSISTANT_STATE_PATH,
		handler: async (req, res) => {
			if (req.method === "GET") {
				answer(res, 200, "application/json; charset=utf-8", JSON.stringify(bridge.readState()));
				return;
			}
			if (req.method !== "POST") {
				answer(res, 405, "application/json; charset=utf-8", JSON.stringify({ error: "Method not allowed" }));
				return;
			}
			const secretarySessionId = readSessionId(readJsonBody(await readBody(req))?.secretarySessionId);
			if (secretarySessionId === void 0) {
				answer(res, 400, "application/json; charset=utf-8", JSON.stringify({ error: "secretarySessionId is required" }));
				return;
			}
			bridge.bindSecretarySession(secretarySessionId);
			answer(res, 200, "application/json; charset=utf-8", JSON.stringify(bridge.readState()));
		}
	}), "ui-a2a-assistant: bridge state route");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: ASSISTANT_REPLIES_PATH,
		handler: async (req, res) => {
			if (req.method !== "POST") {
				answer(res, 405, "application/json; charset=utf-8", JSON.stringify({ error: "Method not allowed" }));
				return;
			}
			const parsed = readJsonBody(await readBody(req));
			const messageId = typeof parsed?.messageId === "string" ? parsed.messageId : void 0;
			const text = readMessageText(parsed?.text);
			const source = messageId === void 0 ? void 0 : bridge.find(messageId);
			if (messageId === void 0 || text === void 0 || source === void 0) {
				answer(res, 400, "application/json; charset=utf-8", JSON.stringify({ error: "messageId and text are required" }));
				return;
			}
			source.status = "handled";
			bridge.append({
				conversation: source.conversation,
				role: "assistant",
				text,
				source: "web",
				status: "handled"
			});
			if (source.telegramChatId !== void 0) {
				const token = await resolveOptionalCredential(ctx, current().telegramBotTokenEnv);
				if (token !== void 0) await sendTelegramMessage(token, source.telegramChatId, text);
			}
			answer(res, 200, "application/json; charset=utf-8", JSON.stringify({ ok: true }));
		}
	}), "ui-a2a-assistant: bridge reply route");
	ctx.effect(() => {
		const poll = async () => {
			if (telegramPolling) return;
			telegramPolling = true;
			try {
				const settings = current();
				const token = await resolveOptionalCredential(ctx, settings.telegramBotTokenEnv);
				if (token === void 0) return;
				const result = await telegramRequest(token, `getUpdates?timeout=0&offset=${telegramOffset}`);
				const allowed = parseAllowedTelegramUsers(settings.telegramAllowedUserIds);
				for (const update of result.result ?? []) {
					const updateId = readNumber(update.update_id);
					if (updateId !== void 0) telegramOffset = Math.max(telegramOffset, updateId + 1);
					const message = update.message;
					const chatId = readNumber(message?.chat?.id);
					const userId = readNumber(message?.from?.id);
					const messageId = readNumber(message?.message_id);
					const text = readMessageText(message?.text);
					if (chatId === void 0 || text === void 0) continue;
					if (allowed.size > 0 && (userId === void 0 || !allowed.has(userId))) continue;
					if (isDashboardCommand(text)) {
						await sendTelegramMessage(token, chatId, dashboardReply(settings));
						continue;
					}
					const bridgeMessage = {
						conversation: "self",
						role: "user",
						text,
						source: "telegram",
						telegramChatId: chatId,
						status: "pending"
					};
					if (messageId !== void 0) bridge.append({
						...bridgeMessage,
						telegramMessageId: messageId
					});
					else bridge.append(bridgeMessage);
				}
			} finally {
				telegramPolling = false;
			}
		};
		const timer = setInterval(() => {
			poll().catch(() => {});
		}, Math.max(500, current().bridgePollIntervalMs));
		poll().catch(() => {});
		return () => {
			clearInterval(timer);
		};
	}, "ui-a2a-assistant: Telegram polling bridge");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: REALTIME_PATH,
		handler: async (req, res) => {
			if (req.method !== "POST") {
				answer(res, 405, "application/json; charset=utf-8", JSON.stringify({ error: "Method not allowed" }));
				return;
			}
			const settings = current();
			const credential = await ctx.credentials.resolve(credentialRef(settings.apiKeyEnv));
			if (credential === void 0) {
				answer(res, 503, "application/json; charset=utf-8", JSON.stringify({ error: `${settings.apiKeyEnv} is not configured` }));
				return;
			}
			const secretResponse = await createRealtimeClientSecret(credential.value, settings);
			const secretBody = await secretResponse.text();
			if (!secretResponse.ok) {
				answer(res, secretResponse.status, secretResponse.headers.get("content-type") ?? "application/json; charset=utf-8", secretBody);
				return;
			}
			const clientSecret = readClientSecret(secretBody);
			if (clientSecret === void 0) {
				answer(res, 502, "application/json; charset=utf-8", JSON.stringify({ error: "OpenAI returned an invalid Realtime client secret" }));
				return;
			}
			answer(res, 200, "application/json; charset=utf-8", JSON.stringify({
				value: clientSecret,
				callsURL: `${settings.baseURL.replace(/\/$/u, "")}/realtime/calls`
			}));
		}
	}), "ui-a2a-assistant: OpenAI Realtime call route");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: SECRETARY_TTS_PATH,
		handler: async (req, res) => {
			if (req.method !== "POST") {
				answer(res, 405, "application/json; charset=utf-8", JSON.stringify({ error: "Method not allowed" }));
				return;
			}
			const text = readTtsText(await readBody(req));
			if (text === void 0) {
				answer(res, 400, "application/json; charset=utf-8", JSON.stringify({ error: "Text is required and must be at most 4000 characters" }));
				return;
			}
			const speechResponse = await createSecretarySpeech(ctx, text, current());
			const speechBody = new Uint8Array(await speechResponse.arrayBuffer());
			const contentType = speechResponse.headers.get("content-type") ?? "audio/mpeg";
			answerBytes(res, speechResponse.status, contentType, speechBody);
		}
	}), "ui-a2a-assistant: Secretary TTS route");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: SECRETARY_ASR_PATH,
		handler: async (req, res) => {
			if (req.method !== "POST") {
				answer(res, 405, "application/json; charset=utf-8", JSON.stringify({ error: "Method not allowed" }));
				return;
			}
			const audio = readAsrAudio(await readBody(req));
			if (audio === void 0 || audio.byteLength === 0) {
				answer(res, 400, "application/json; charset=utf-8", JSON.stringify({ error: "Audio is required and must be at most 2MB" }));
				return;
			}
			const asrResponse = await createSecretaryAsr(audio, current(), readAliyunNlsToken);
			const body = await asrResponse.text();
			answer(res, asrResponse.status, asrResponse.headers.get("content-type") ?? "application/json; charset=utf-8", body);
		}
	}), "ui-a2a-assistant: Secretary Aliyun ASR route");
}
//#endregion
export { Config, apply, createAliyunAsrTranscript, createAliyunNlsToken, createMiniMaxSpeech, createRealtimeClientSecret, inject, name };
