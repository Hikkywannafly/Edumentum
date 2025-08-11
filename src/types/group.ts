export interface GroupResponse {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  key: string;
  createdAt: string;
  public: boolean;
}

export interface GroupRequest {
  name: string;
  description: string;
  memberCount: number;
  public: boolean;
}

export interface GetGroupsAPIResponse {
  data: GroupResponse[];
  status: string;
  message: string;
}
