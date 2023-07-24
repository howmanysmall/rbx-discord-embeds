/**
 * The type of timestamp.
 */
export enum TimestampType {
	/**
	 * A short time format.
	 * @example 11:12 AM
	 */
	ShortTime,

	/**
	 * A long time format.
	 * @example 11:12:30 AM
	 */
	LongTime,

	/**
	 * A short date format.
	 * @example 07/25/2023
	 */
	ShortDate,

	/**
	 * A long date format.
	 * @example July 25, 2023
	 */
	LongDate,

	/**
	 * A long date with short time format.
	 * @example July 25, 2023 11:12 AM
	 */
	LongDateWithShortTime,

	/**
	 * A long date with day of week and short time format.
	 * @example Tuesday, July 25, 2023 11:12 AM
	 */
	LongDateWithDayOfWeekAndShortTime,

	/**
	 * A relative timestamp.
	 * @example in a day
	 */
	Relative,
}

/**
 * Creates a Discord timestamp for the given Unix timestamp.
 * @param timestampType
 * @param unixTimestamp
 * @returns
 */
export const CreateTimestampForUnixTimestamp = (timestampType: TimestampType, unixTimestamp: number) => {
	switch (timestampType) {
		case TimestampType.ShortTime:
			return `<t:${unixTimestamp}:t>`;

		case TimestampType.LongTime:
			return `<t:${unixTimestamp}:T>`;

		case TimestampType.ShortDate:
			return `<t:${unixTimestamp}:d>`;

		case TimestampType.LongDate:
			return `<t:${unixTimestamp}:D>`;

		case TimestampType.LongDateWithShortTime:
			return `<t:${unixTimestamp}:f>`;

		case TimestampType.LongDateWithDayOfWeekAndShortTime:
			return `<t:${unixTimestamp}:F>`;

		case TimestampType.Relative:
			return `<t:${unixTimestamp}:R>`;

		default:
			error(`Invalid timestamp type ${timestampType}`);
	}
};

/**
 * Creates a Discord timestamp for the given DateTime.
 * @param timestampType
 * @param dateTime
 * @returns
 */
export const CreateTimestampForDateTime = (timestampType: TimestampType, dateTime: DateTime) =>
	CreateTimestampForUnixTimestamp(timestampType, dateTime.UnixTimestamp);

/**
 * Creates a Discord timestamp for the current time.
 * @param timestampType
 * @returns
 */
export const CreateTimestampForNow = (timestampType: TimestampType) =>
	CreateTimestampForUnixTimestamp(timestampType, DateTime.now().UnixTimestamp);
