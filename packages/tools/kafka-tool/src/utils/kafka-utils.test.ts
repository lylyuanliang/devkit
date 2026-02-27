import { isSystemTopic } from '../kafka-utils';

describe('kafka-utils', () => {
  describe('isSystemTopic', () => {
    it('should return true for topics starting with __', () => {
      expect(isSystemTopic('__consumer_offsets')).toBe(true);
      expect(isSystemTopic('__transaction_state')).toBe(true);
      expect(isSystemTopic('__schema_registry')).toBe(true);
    });

    it('should return false for user topics', () => {
      expect(isSystemTopic('my-topic')).toBe(false);
      expect(isSystemTopic('user_events')).toBe(false);
      expect(isSystemTopic('_internal_topic')).toBe(false);
      expect(isSystemTopic('topic')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isSystemTopic('')).toBe(false);
    });

    it('should return false for single underscore', () => {
      expect(isSystemTopic('_topic')).toBe(false);
    });
  });
});
