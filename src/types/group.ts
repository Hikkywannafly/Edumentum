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

export interface UserGroupResponse {
  id: number;
  username: string;
  imageUrl: string;
}

export interface GroupDetailResponse {
  id: number;
  member: number;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  key: string;
  name: string;
  description: string;
  userGroupResponseList: UserGroupResponse[];
}

export interface GetGroupsDetailAPIResponse {
  data: GroupDetailResponse;
  status: string;
  message: string;
}
