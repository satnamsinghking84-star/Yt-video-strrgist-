# Security Specification & Threat Model for Creator Hisaab Firestore Integration

## 1. Data Invariants
- **Channels**: Must have a valid string `id`, `name` (1-100 characters), `handle` (starts with @ or standard string), and `color` (valid hex or color string). Must contain `createdAt` ISO timestamp.
- **Videos**: Must belong to a valid `channelId`. Title is required and limited to 200 characters. Status must be one of `Pending`, `Scheduled`, or `Published`. Checklist must be an object representing the 6 workflow steps. `createdAt` and `updatedAt` are required.
- **Ideas**: Must belong to a valid `channelId`. Text is required and limited to 500 characters.

---

## 2. The "Dirty Dozen" Payloads (Exploit Payloads)
The following payloads attempt to break data integrity, spoof identity, inject oversized/poisoned data, or alter immutable timestamps. These payloads must return `PERMISSION_DENIED` under all circumstances.

### Payload 1: ID Poisoning in Channels (Resource Poisoning)
Attempting to create a channel with a massive, 2048-byte invalid ID string.
```json
{
  "path": "channels/ch_very_long_garbage_id_poisoning_payload_12345...",
  "data": {
    "id": "ch_very_long_garbage_id_poisoning_payload_12345...",
    "name": "Coconut Vlogs",
    "handle": "@coconutvlogs",
    "color": "#B4690E",
    "createdAt": "2026-07-15T08:00:00.000Z"
  }
}
```

### Payload 2: Channel Name Overflow (Data Poisoning)
Attempting to save a channel with a name that is 50,000 characters long.
```json
{
  "path": "channels/ch-1",
  "data": {
    "id": "ch-1",
    "name": "Coconut Vlogs Coconut Vlogs Coconut Vlogs... [50,000 chars]",
    "handle": "@coconutvlogs",
    "color": "#B4690E",
    "createdAt": "2026-07-15T08:00:00.000Z"
  }
}
```

### Payload 3: Unauthenticated Channel Creation (Identity Spoofing)
An unauthenticated request trying to insert a new channel.
```json
{
  "auth": null,
  "path": "channels/ch-3",
  "data": {
    "id": "ch-3",
    "name": "New Channel",
    "handle": "@new",
    "color": "#CCCCCC",
    "createdAt": "2026-07-15T08:00:00.000Z"
  }
}
```

### Payload 4: Invalid Status Injection in Videos (State Shortcutting)
Attempting to set an unsupported status (e.g., "Archived" or "Leaked").
```json
{
  "path": "videos/vid-1",
  "data": {
    "id": "vid-1",
    "channelId": "ch-1",
    "title": "Coconut Logistics Guide",
    "status": "Archived",
    "checklist": { "thumbnail": false },
    "createdAt": "2026-07-15T08:00:00.000Z",
    "updatedAt": "2026-07-15T08:00:00.000Z"
  }
}
```

### Payload 5: Video Title Overflow (Value Poisoning)
Inserting a video title exceeding 200 characters limit.
```json
{
  "path": "videos/vid-2",
  "data": {
    "id": "vid-2",
    "channelId": "ch-1",
    "title": "A super long title that has more than two hundred characters and exceeds the strict volumetric limitations outlined in our database blueprint to prevent denial of wallet attacks through massive indexing resource exhaustion...",
    "status": "Pending",
    "checklist": {},
    "createdAt": "2026-07-15T08:00:00.000Z",
    "updatedAt": "2026-07-15T08:00:00.000Z"
  }
}
```

### Payload 6: Missing Required Checklist (Schema Validation Gap)
Creating a video without the required `checklist` property.
```json
{
  "path": "videos/vid-3",
  "data": {
    "id": "vid-3",
    "channelId": "ch-1",
    "title": "Zindagi Shorts",
    "status": "Published",
    "createdAt": "2026-07-15T08:00:00.000Z",
    "updatedAt": "2026-07-15T08:00:00.000Z"
  }
}
```

### Payload 7: Timestamp Tampering on Creation (Temporal Integrity)
Using client-defined timestamps instead of the required `request.time` server timestamp.
```json
{
  "path": "videos/vid-4",
  "data": {
    "id": "vid-4",
    "channelId": "ch-1",
    "title": "Test video",
    "status": "Pending",
    "checklist": {},
    "createdAt": "1990-01-01T00:00:00.000Z",
    "updatedAt": "2026-07-15T08:00:00.000Z"
  }
}
```

### Payload 8: Shadow Field Injection (Ghost Fields)
Injecting a ghost field like `isAdmin: true` or `isVerified: true` into the video document.
```json
{
  "path": "videos/vid-5",
  "data": {
    "id": "vid-5",
    "channelId": "ch-1",
    "title": "Test Video",
    "status": "Pending",
    "checklist": {},
    "createdAt": "2026-07-15T08:00:00.000Z",
    "updatedAt": "2026-07-15T08:00:00.000Z",
    "isVerifiedByGoogle": true
  }
}
```

### Payload 9: Orphaned Video Creation (Relational Integrity)
Attempting to create a video tied to a non-existent channel ID `ch-nonexistent`.
```json
{
  "path": "videos/vid-6",
  "data": {
    "id": "vid-6",
    "channelId": "ch-nonexistent",
    "title": "Orphaned Video",
    "status": "Pending",
    "checklist": {},
    "createdAt": "2026-07-15T08:00:00.000Z",
    "updatedAt": "2026-07-15T08:00:00.000Z"
  }
}
```

### Payload 10: Modifying Immutable Field during Update (Immutability Violation)
Attempting to change `createdAt` of an existing video project during update.
```json
{
  "path": "videos/vid-1",
  "data": {
    "createdAt": "2020-01-01T00:00:00.000Z"
  }
}
```

### Payload 11: Idea Text Overflow (Denial of Wallet)
Attempting to create an idea with a 10MB text string.
```json
{
  "path": "ideas/id-1",
  "data": {
    "id": "id-1",
    "text": "Extremely long text... [Oversized]",
    "channelId": "ch-1",
    "createdAt": "2026-07-15T08:00:00.000Z"
  }
}
```

### Payload 12: Email Verification Spoofing (Identity Spoofing)
Attempting to access resource with a token that has verified email equal to `false`.
```json
{
  "auth": {
    "uid": "attacker_123",
    "token": {
      "email_verified": false
    }
  },
  "path": "channels/ch-1",
  "operation": "write"
}
```

---

## 3. Test Runner Definitions
These security policies are mathematically enforced by the rules set up in `firestore.rules`. Any bypass attempt (like the Dirty Dozen above) fails with `PERMISSION_DENIED` at the Firestore layer.
