export interface ConsumerGroup {
  group_id: string;
  state: string;
  protocol_type: string;
  members_count: number;
  total_lag: number;
}

export interface ConsumerGroupMember {
  member_id: string;
  client_id: string;
  host: string;
}

export interface ConsumerGroupDetails {
  group_id: string;
  state: string;
  protocol_type: string;
  members: ConsumerGroupMember[];
  topics: string[];
}

export interface PartitionOffset {
  topic: string;
  partition: number;
  current_offset: number;
  log_end_offset: number;
  lag: number;
}

export interface ResetOffsetsRequest {
  group_id: string;
  strategy: 'beginning' | 'end' | 'timestamp';
  timestamp?: number;
}
