// BC-Mobile-7E — Network feed DTO (presentation over the canonical Moment
// domain). No parallel post/feed backend: a feed item IS one owner-private
// Meeting Moment (business_relationship_moments) projected for the viewer.

export const BC_NETWORK_FEED_PAGE_SIZE = 12;
/** Ảnh hiển thị trong lưới; phần dư hiện dưới dạng "+N". */
export const BC_NETWORK_FEED_GRID_PHOTOS = 3;

export type BcNetworkFeedItem = {
  momentId: string;
  /** Opaque person id shared with 2A (`u:` | `c:` | `g:`). */
  personId: string;
  occurredAt: string;
  /** Tên sự kiện (dòng "ngày · địa điểm" ghép từ occurredAt + place). */
  eventName: string | null;
  placeLabel: string | null;
  /** Câu mô tả cuộc gặp. */
  note: string | null;
  /** URL ký ngắn hạn, tối đa 5 ảnh, theo thứ tự sort_order. */
  photoUrls: string[];
  photoCount: number;
};

export type BcNetworkFeedPage = {
  items: BcNetworkFeedItem[];
  nextCursor: string | null;
};
