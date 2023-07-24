const HttpService = game.GetService("HttpService");
import BitField from "@rbxts/rbx-bitfield";
import EmbedBuilder, { EmbedData } from "./embed-builder";

import { Append, GetUtf8Length, IsValidUrl } from "./utility";
import type { Url } from "./types";

/**
 * Flags for the message.
 */
export enum MessageFlags {
	SUPPRESS_EMBEDS = 1 << 2,
	SUPPRESS_NOTIFICATIONS = 1 << 12,
}

/**
 * A class for building a message to send to Discord.
 */
export default class ContentBuilder {
	/**
	 * Validates that the value is a ContentBuilder.
	 * @param value
	 * @returns
	 */
	public static readonly Is = (value: unknown): value is ContentBuilder => {
		if (!typeIs(value, "table")) return false;
		return value instanceof ContentBuilder;
	};

	/**
	 * Sets the username of the webhook. Must be less than 80 characters.
	 * @throws If username is greater than 80 characters.
	 * @throws If username has any invalid byte sequences.
	 * @param username The username.
	 * @returns
	 */
	public SetUsername(username: string) {
		if (GetUtf8Length(username) > 80) error("Username must be less than 80 characters");
		this.EmbedData.username = username;
		return this;
	}

	/**
	 * Sets the avatar URL of the webhook. Must be a valid URL.
	 * @throws If avatarUrl is not a valid URL.
	 * @param avatarUrl The avatar URL.
	 * @returns
	 */
	public SetAvatarUrl(avatarUrl: Url) {
		assert(IsValidUrl(avatarUrl), "Avatar URL must be a valid URL");
		this.EmbedData.avatar_url = avatarUrl;
		return this;
	}

	/**
	 * Sets the content of the webhook. Must be less than 2000 characters.
	 * @throws If content is greater than 2000 characters.
	 * @throws If content has any invalid byte sequences.
	 * @param content The content.
	 * @returns
	 */
	public SetContent(content: string) {
		if (GetUtf8Length(content) > 2000) error("Content must be less than 2000 characters");
		this.EmbedData.content = content;
		return this;
	}

	/**
	 * Sets the thread name of the webhook. Must be less than 100 characters.
	 * @throws If threadName is greater than 100 characters.
	 * @throws If threadName has any invalid byte sequences.
	 * @param threadName The thread name.
	 * @returns
	 */
	public SetThread(threadName: string) {
		if (GetUtf8Length(threadName) > 100) error("Thread name must be less than 100 characters");
		this.EmbedData.thread_name = threadName;
		return this;
	}

	/**
	 * Adds a flag to the message.
	 * @param flag The flag to add.
	 * @returns
	 */
	public AddFlag(flag: MessageFlags) {
		if (this.Flags.Intersects(flag)) {
			warn("Flag already set.");
			return this;
		}

		this.Flags = this.Flags.On(flag);
		return this;
	}

	/**
	 * Adds an embed to the message.
	 * @throws If embed is not an EmbedBuilder.
	 * @param embed The embed to add.
	 * @returns
	 */
	public AddEmbed(embed: EmbedBuilder) {
		assert(EmbedBuilder.Is(embed), "Embed must be an EmbedBuilder");
		const embeds = this.EmbedData.embeds as Array<EmbedData> | undefined;
		this.EmbedData.embeds = Append(embeds ?? new Array<EmbedData>(), embed.EmbedData);
		return this;
	}

	/**
	 * Adds an image to the message.
	 * @throws If image is not a valid URL.
	 * @throws If bodyUrl is not a valid URL.
	 * @param image The image to add.
	 * @param bodyUrl The URL to open when the image is clicked.
	 * @returns
	 */
	public AddImage(image: Url, bodyUrl: Url) {
		assert(IsValidUrl(image), "'image' must be a valid URL");
		assert(IsValidUrl(bodyUrl), "'bodyUrl' must be a valid URL");
		const embeds = this.EmbedData.embeds as Array<EmbedData> | undefined;
		this.EmbedData.embeds = Append(
			embeds ?? new Array<EmbedData>(),
			new EmbedBuilder().AddImage(image).SetBodyUrl(bodyUrl).EmbedData,
		);

		return this;
	}

	/**
	 * Serializes the content builder into a table.
	 * @returns The serialized content builder.
	 */
	public Serialize(): Record<string, unknown> {
		return {
			...this.EmbedData,
			flags: this.Flags.Value,
		};
	}

	/**
	 * Serializes the content builder into a JSON string.
	 * @alias {@link ToJson}
	 * @returns
	 */
	public SerializeAsJson() {
		return HttpService.JSONEncode({
			...this.EmbedData,
			flags: this.Flags.Value,
		});
	}

	/**
	 * Alias for {@link SerializeAsJson}
	 */
	public ToJson() {
		return HttpService.JSONEncode({
			...this.EmbedData,
			flags: this.Flags.Value,
		});
	}

	private readonly EmbedData: Record<string, unknown> = {
		attachments: new Array<void>(),
	};

	private Flags = new BitField();
}

const metatable = getmetatable(ContentBuilder) as LuaMetatable<ContentBuilder>;
metatable.__tostring = (value) => value.SerializeAsJson();
