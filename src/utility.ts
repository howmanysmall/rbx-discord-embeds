import { t } from "@rbxts/t";

export const IsValidUrl = t.match("^https?://");

export const Append = <T extends defined>(array: Array<T>, ...values: Array<T>) => {
	const result = table.clone(array);
	for (const value of values) result.push(value);
	return result;
};

export const GetUtf8Length = (value: string) => {
	const [valueLength, invalidBytePosition] = utf8.len(value);
	assert(
		valueLength !== undefined && valueLength !== false,
		"string `%*` has an invalid byte at position %*".format(value, tostring(invalidBytePosition)),
	);

	return valueLength;
};
