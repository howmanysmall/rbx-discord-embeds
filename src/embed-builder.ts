const HttpService = game.GetService("HttpService");

import { Append, GetUtf8Length, IsValidUrl } from "./utility";
import { t } from "@rbxts/t";
import { $terrify } from "rbxts-transformer-t";
import type { Iso8601, Iso8601Discord, Url } from "./types";

const MatchIso8601 = t.match("^%d%d%d%d%-%d%d%-%d%dT%d%d:%d%d:%d%dZ$");
const MatchIso8601DiscordTimestamp = t.match("^%d%d%d%d%-%d%d%-%d%dT%d%d:%d%d:%d%d%.%d%d%dZ$");

const IsValidIso8601 = (value: string): value is Iso8601 => MatchIso8601(value);
const IsValidIso8601DiscordTimestamp = (value: string): value is Iso8601Discord => MatchIso8601DiscordTimestamp(value);

const ConvertToDiscordTimestamp = (iso8601: string) => (iso8601.sub(1, -2) + ".000Z") as Iso8601Discord;

interface FieldData {
	inline?: boolean;
	name: string;
	value: string;
}

interface FooterData {
	icon_url?: Url;
	text?: string;
}

interface AuthorData {
	icon_url?: Url;
	name?: string;
	url?: Url;
}

export interface EmbedData {
	author?: AuthorData;
	color?: number;
	description?: string;
	fields?: Array<FieldData>;
	footer?: FooterData;
	image?: { url: Url };
	thumbnail?: { url: Url };
	timestamp?: Iso8601Discord;
	title?: string;
	url?: Url;
}

const IsFieldData = $terrify<FieldData>();
const IsValidEmbedData = $terrify<{
	author?: {
		icon_url?: string;
		name?: string;
		url?: string;
	};

	color?: number;
	description?: string;
	fields?: Array<FieldData>;
	footer?: {
		icon_url?: string;
		text?: string;
	};

	image?: { url: string };
	thumbnail?: { url: string };
	timestamp?: string;
	title?: string;
	url?: string;
}>();

const IsValidUrlOptional = t.optional(IsValidUrl);
const IsOptionalString = t.optional(t.string);

const IsUrlInterface = t.optional(
	t.interface({
		url: IsValidUrlOptional,
	}),
);

const IsArrayOfFieldData = t.array(IsFieldData);
const IsStrictValidEmbedData = t.interface({
	author: t.optional(
		t.interface({
			icon_url: IsValidUrlOptional,
			name: IsOptionalString,
			url: IsValidUrlOptional,
		}),
	),

	color: t.optional(t.integer),
	description: IsOptionalString,
	fields: t.optional(IsArrayOfFieldData),
	footer: t.optional(
		t.interface({
			icon_url: IsValidUrlOptional,
			text: IsOptionalString,
		}),
	),

	image: IsUrlInterface,
	thumbnail: IsUrlInterface,
	timestamp: t.optional(t.union(MatchIso8601, MatchIso8601DiscordTimestamp)),
	title: IsOptionalString,
	url: IsValidUrlOptional,
});

export default class EmbedBuilder {
	/**
	 * The embed data.
	 */
	public readonly EmbedData: EmbedData = {};

	/**
	 * Validates that the value is an EmbedBuilder.
	 * @param value
	 * @returns
	 */
	public static readonly Is = (value: unknown): value is EmbedBuilder => {
		if (!typeIs(value, "table")) return false;
		return value instanceof EmbedBuilder;
	};

	/**
	 * Asserts that the embed data is valid.
	 * @returns
	 */
	public AssertIsValidEmbedData() {
		assert(IsValidEmbedData(this.EmbedData), "Invalid embed data");
		return this;
	}

	/**
	 * Asserts that the embed data is valid. This is quite a bit more strict than {@link AssertIsValidEmbedData}
	 * @returns
	 */
	public AssertIsStrictValidEmbedData() {
		assert(IsStrictValidEmbedData(this.EmbedData), "Invalid embed data");
		return this;
	}

	/**
	 * Sets the title of the embed.
	 * @throws If title is longer than 256 characters.
	 * @throws If title has any invalid byte sequences.
	 * @param title The title.
	 * @returns
	 */
	public SetTitle(title: string) {
		if (GetUtf8Length(title) > 256) error("'title' must be less than 256 characters");
		this.EmbedData.title = title;
		return this;
	}

	/**
	 * Sets the description of the embed.
	 * @throws If description is longer than 4096 characters.
	 * @throws If description has any invalid byte sequences.
	 * @param description The description.
	 * @returns
	 */
	public SetDescription(description: string) {
		if (GetUtf8Length(description) > 4096) error("'description' must be less than 2048 characters");
		this.EmbedData.description = description;
		return this;
	}

	/**
	 * Sets the URL of the embed.
	 * @throws If the URL is invalid.
	 * @alias {@link SetBodyUrl}
	 * @param url The URL.
	 * @returns
	 */
	public SetUrl(url: Url) {
		assert(IsValidUrl(url), "'url' must be a valid URL");
		this.EmbedData.url = url;
		return this;
	}

	/**
	 * Alias for {@link SetUrl}.
	 */
	public SetBodyUrl(url: Url) {
		return this.SetUrl(url);
	}

	/**
	 * Sets the color of the embed.
	 * @param color The color integer.
	 * @returns
	 */
	public SetColor(color: number) {
		this.EmbedData.color = color;
		return this;
	}

	/**
	 * Sets the color of the embed using a Color3 value.
	 * @throws If the Color3 value couldn't be converted to a number.
	 * @param color The Color3 value.
	 * @returns
	 */
	public SetColorFromColor3(color: Color3) {
		const value = tonumber(color.ToHex(), 16);
		assert(value, "Couldn't get color value from Color3?");

		this.EmbedData.color = value;
		return this;
	}

	/**
	 * Sets the author of the embed.
	 * @throws If authorName is longer than 256 characters.
	 * @throws If authorUrl is invalid.
	 * @throws If authorIcon URL is invalid.
	 * @throws If authorName has any invalid byte sequences.
	 * @param authorName The name of the author.
	 * @param authorUrl The URL of the author.
	 * @param authorIconUrl The icon URL of the author.
	 * @returns
	 */
	public SetAuthor(authorName: string, authorUrl?: Url, authorIconUrl?: Url) {
		this.SetAuthorName(authorName);
		if (authorUrl !== undefined) this.SetAuthorUrl(authorUrl);
		if (authorIconUrl !== undefined) this.SetAuthorIconUrl(authorIconUrl);
		return this;
	}

	/**
	 * Sets the name of the author of the embed.
	 * @throws If authorName is longer than 256 characters.
	 * @throws If authorName has any invalid byte sequences.
	 * @param authorName The name of the author.
	 * @returns
	 */
	public SetAuthorName(authorName: string) {
		if (GetUtf8Length(authorName) > 256) error("'authorName' must be less than 256 characters");
		const author = table.clone(this.EmbedData.author ?? {});
		author.name = authorName;
		this.EmbedData.author = author;
		return this;
	}

	/**
	 * Sets the URL of the author of the embed.
	 * @throws If authorUrl is invalid.
	 * @param authorUrl The URL of the author.
	 * @returns
	 */
	public SetAuthorUrl(authorUrl: Url) {
		assert(IsValidUrl(authorUrl), "'authorUrl' must be a valid URL");
		const author = table.clone(this.EmbedData.author ?? {});
		author.url = authorUrl;
		this.EmbedData.author = author;
		return this;
	}

	/**
	 * Sets the icon URL of the author of the embed.
	 * @throws If authorIconUrl is invalid.
	 * @param authorIconUrl The icon URL of the author.
	 * @returns
	 */
	public SetAuthorIconUrl(authorIconUrl: Url) {
		assert(IsValidUrl(authorIconUrl), "'authorIconUrl' must be a valid URL");
		const author = table.clone(this.EmbedData.author ?? {});
		author.icon_url = authorIconUrl;
		this.EmbedData.author = author;
		return this;
	}

	/**
	 * Sets the footer of the embed.
	 * @throws If footerText is longer than 2048 characters.
	 * @throws If footerText has any invalid byte sequences.
	 * @throws If footerIconUrl is invalid.
	 * @param footerText The text of the footer.
	 * @param footerIconUrl The icon URL of the footer.
	 * @returns
	 */
	public SetFooter(footerText: string, footerIconUrl?: Url) {
		this.SetFooterText(footerText);
		if (footerIconUrl !== undefined) this.SetFooterIconUrl(footerIconUrl);
		return this;
	}

	/**
	 * Sets the footer text of the embed.
	 * @throws If footerText is longer than 2048 characters.
	 * @throws If footerText has any invalid byte sequences.
	 * @param footerText The text of the footer.
	 * @returns
	 */
	public SetFooterText(footerText: string) {
		if (GetUtf8Length(footerText) > 2048) error("'footerText' must be less than 2048 characters");
		const footer = table.clone(this.EmbedData.footer ?? {});
		footer.text = footerText;
		this.EmbedData.footer = footer;
		return this;
	}

	/**
	 * Sets the footer icon URL of the embed.
	 * @throws If footerIconUrl is invalid.
	 * @param footerIconUrl The icon URL of the footer.
	 * @returns
	 */
	public SetFooterIconUrl(footerIconUrl: Url) {
		assert(IsValidUrl(footerIconUrl), "'footerIconUrl' must be a valid URL");
		const footer = table.clone(this.EmbedData.footer ?? {});
		footer.icon_url = footerIconUrl;
		this.EmbedData.footer = footer;
		return this;
	}

	/**
	 * Sets the embed timestamp.
	 * @throws If the timestamp is invalid.
	 * @param timestamp The timestamp.
	 * @returns
	 */
	public SetTimestamp(timestamp: string) {
		if (IsValidIso8601(timestamp)) timestamp = ConvertToDiscordTimestamp(timestamp);

		assert(
			IsValidIso8601DiscordTimestamp(timestamp),
			"'timestamp' must be a valid ISO8601 timestamp (YYYY-MM-DDTHH:MM:SS.000Z)",
		);

		this.EmbedData.timestamp = timestamp;
		return this;
	}

	/**
	 * Sets the embed timestamp using a DateTime.
	 * @throws If the timestamp is invalid.
	 * @param dateTime The DateTime.
	 * @returns
	 */
	public SetTimestampFromDateTime(dateTime: DateTime) {
		return this.SetTimestamp(dateTime.ToIsoDate());
	}

	/**
	 * Sets the embed timestamp using a UnixTimestamp integer.
	 * @throws If the timestamp is invalid.
	 * @param unixTimestamp The unix timestamp.
	 * @returns
	 */
	public SetTimestampFromUnixTimestamp(unixTimestamp: number) {
		return this.SetTimestamp(DateTime.fromUnixTimestamp(unixTimestamp).ToIsoDate());
	}

	/**
	 * Sets the embed timestamp using a UnixTimestampMillis integer.
	 * @throws If the timestamp is invalid.
	 * @param unixTimestamp The unix timestamp with milliseconds.
	 * @returns
	 */
	public SetTimestampFromUnixTimestampMillis(unixTimestampMillis: number) {
		return this.SetTimestamp(DateTime.fromUnixTimestampMillis(unixTimestampMillis).ToIsoDate());
	}

	/**
	 * Adds a field to the embed.
	 * @alias {@link SetField}
	 * @throws If fieldName is longer than 256 characters.
	 * @throws If fieldName has any invalid byte sequences.
	 * @throws If fieldValue is longer than 1024 characters.
	 * @throws If fieldValue has any invalid byte sequences.
	 * @param name The name of the field.
	 * @param value The value of the field.
	 * @param inline Whether or not the field should be inline.
	 * @returns
	 */
	public AddField(name: string, value: string, inline?: boolean) {
		if (GetUtf8Length(name) > 256) error("'name' must be less than 256 characters");
		if (GetUtf8Length(value) > 1024) error("'value' must be less than 1024 characters");
		this.EmbedData.fields = Append(this.EmbedData.fields ?? [], { inline, name, value });
		return this;
	}

	/**
	 * Alias for {@link AddField}.
	 */
	public SetField(name: string, value: string, inline?: boolean) {
		if (GetUtf8Length(name) > 256) error("'name' must be less than 256 characters");
		if (GetUtf8Length(value) > 1024) error("'value' must be less than 1024 characters");
		this.EmbedData.fields = Append(this.EmbedData.fields ?? [], { inline, name, value });
		return this;
	}

	/**
	 * Adds an array of fields to the embed.
	 * @throws If any of the fields are invalid.
	 * @alias {@link SetFields}
	 * @param args The fields to add.
	 * @returns
	 */
	public AddFields(...args: Array<FieldData>) {
		assert(IsArrayOfFieldData(args), "'args' must be an array of IFieldData");
		this.EmbedData.fields = Append(this.EmbedData.fields ?? [], ...args);
		return this;
	}

	/**
	 * Alias for {@link AddFields}.
	 */
	public SetFields(...args: Array<FieldData>) {
		this.EmbedData.fields = Append(this.EmbedData.fields ?? [], ...args);
		return this;
	}

	/**
	 * Sets the embed image.
	 * @throws If the URL is invalid.
	 * @alias {@link AddImage}
	 * @param url The image URL.
	 * @returns
	 */
	public SetImage(url: Url) {
		assert(IsValidUrl(url), "'url' must be a valid URL");
		this.EmbedData.image = { url };
		return this;
	}

	/**
	 * Sets the embed thumbnail.
	 * @throws If the URL is invalid.
	 * @alias {@link AddThumbnail}
	 * @param url The thumbnail URL.
	 * @returns
	 */
	public SetThumbnail(url: Url) {
		assert(IsValidUrl(url), "'url' must be a valid URL");
		this.EmbedData.thumbnail = { url };
		return this;
	}

	/**
	 * Alias for {@link SetImage}.
	 */
	public AddImage(url: Url) {
		assert(IsValidUrl(url), "'url' must be a valid URL");
		this.EmbedData.image = { url };
		return this;
	}

	/**
	 * Alias for {@link SetThumbnail}.
	 */
	public AddThumbnail(url: Url) {
		assert(IsValidUrl(url), "'url' must be a valid URL");
		this.EmbedData.thumbnail = { url };
		return this;
	}

	/**
	 * Converts the embed data to a JSON string.
	 * @alias {@link ToJson}
	 * @returns The embed data as a JSON string.
	 */
	public SerializeAsJson() {
		return HttpService.JSONEncode(this.EmbedData);
	}

	/**
	 * Alias for {@link SerializeAsJson}.
	 */
	public ToJson() {
		return HttpService.JSONEncode(this.EmbedData);
	}
}

const metatable = getmetatable(EmbedBuilder) as LuaMetatable<EmbedBuilder>;
metatable.__tostring = (value) => value.SerializeAsJson();
