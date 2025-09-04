export interface INFT {
  id: string;
  description: string;
  isMinted: boolean;
  createdAt: Date;
  userId?: string;
  organizationId?: string;
  metadataUri?: string;
  tokenId?: string;
}
