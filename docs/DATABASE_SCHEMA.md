# Pageboard — Production Database Schema Blueprint

> **Status:** Forward-looking blueprint for migrating from localStorage to a live production database (Firebase Firestore, Supabase, or MongoDB).  
> **Version:** 1.0  
> **Author:** The Nomadic Nymph & Co.

---

## Overview

This document defines the relational data model for Pageboard when it transitions from a single-user, localStorage-backed app to a multi-user, cloud-hosted platform. The schema is designed to be document-oriented (works with Firestore and MongoDB) while also mapping cleanly to relational tables (Supabase/Postgres).

### Database Options Matrix

| Feature | Firestore | Supabase (Postgres) | MongoDB |
|---------|-----------|---------------------|---------|
| Document model | Native | Via JSONB columns | Native |
| Real-time sync | Built-in | Via Realtime subscriptions | Via Change Streams |
| Auth integration | Firebase Auth | Built-in (GoTrue) | Atlas App Services |
| Query flexibility | Limited (no JOINs) | Full SQL | Aggregation pipeline |
| Free tier | Generous (Spark plan) | Generous (2 projects) | Atlas M0 (512MB) |
| **Recommended for Pageboard** | ⭐ Best fit for document-heavy story data | Good if relational queries needed | Good if team has Mongo expertise |

---

## Collection / Table Definitions

### 1. `users`

Stores organization and author profiles. One user = one organization in the MVP.

```
users/
  {userId}/
    profile: {
      organizationName: string,       // "The Nomadic Nymph & Co."
      displayName: string,
      email: string,
      avatarUrl: string | null,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    activeProjectId: string | null,   // Currently open project
    settings: {
      theme: "dark" | "light",
      defaultTrimSize: "8.5x8.5",
      defaultHasBleed: boolean
    }
```

**Indexes:** `email` (unique)

---

### 2. `projects`

Each project is a self-contained storybook. Users can have multiple projects.

```
projects/
  {projectId}/
    ownerId: string,                  // FK → users
    metadata: {
      title: string,                  // "The Brave Little Fox"
      author: string,
      trimSize: string,               // "8.5x8.5"
      hasBleed: boolean,
      bleedWidthInches: number,       // 0.125
      targetWordCount: number,        // 500
      oracleTargetCards: number,      // 44
    },
    milestones: {
      book: {
        manuscriptDraft: boolean,
        storyboardPlanned: boolean,
        illustrationsSketched: boolean,
        illustrationsFinalized: boolean,
        readyForUpload: boolean
      },
      oracleDeck: {
        cardConceptsDefined: boolean,
        preliminarySketchesDone: boolean,
        cardDescriptionsWritten: boolean,
        finalArtworkComplete: boolean,
        guidebookDrafted: boolean,
        readyForPrint: boolean
      }
    },
    createdAt: timestamp,
    updatedAt: timestamp
```

**Indexes:** `ownerId`, `updatedAt`

---

### 3. `storyboardNodes`

Visual storyboard canvas nodes — representing plot points, scenes, or structural elements arranged spatially.

```
projects/
  {projectId}/
    storyboardNodes/
      {nodeId}/
        title: string,                // "The Spark"
        type: "Beginning" | "Middle" | "End" | "Climax" | "Resolution" | "Custom",
        description: string,          // Optional prose describing the story beat
        coordinates: {
          x: number,
          y: number
        },
        color: string | null,         // Hex or rgba for node tint
        linkedPageIds: string[],      // FK → manuscriptPages (pages this node relates to)
        linkedCharacterIds: string[], // FK → characters
        order: number,                // Sort order for list views
        createdAt: timestamp,
        updatedAt: timestamp
```

**Indexes:** `type`, `order`

---

### 4. `manuscriptPages`

The core page-by-page content. Each page is a self-contained unit with text, illustration directives, and bindings to characters and audio.

```
projects/
  {projectId}/
    manuscriptPages/
      {pageId}/
        pageNumber: number,           // Sequential: 1, 2, 3...
        pageType: "story" | "frontmatter" | "dedication" | "backmatter",
        title: string,                // Optional page title (e.g., "The Escape")
        textContent: string,          // The story text / rhymes
        visualDescription: string,    // Illustration direction notes
        illustrationStatus: "not-started" | "sketching" | "finalizing" | "complete",
        notes: string,                // Author's private notes
        selectedCharacterIds: string[],   // FK → characters featured on this page
        audioSfxBindingId: string | null, // FK → audioAssets
        dialogueSnapshotIds: string[],    // FK → dialogueMatrix (dialogue lines on this page)
        wordCount: number,            // Denormalized for fast queries
        createdAt: timestamp,
        updatedAt: timestamp
```

**Indexes:** `pageNumber` (unique per project), `illustrationStatus`

---

### 5. `characters`

Rich character profiles with metadata for visual design, personality, and magical/fantasy attributes.

```
projects/
  {projectId}/
    characters/
      {characterId}/
        name: string,                 // "Starseed Fairy"
        role: "Protagonist" | "Antagonist" | "Sidekick" | "Supporting" | "Narrator" | "Other",
        emoji: string,                // "🧚"
        auraColor: string,            // "rgba(197,160,89,0.2)" — for UI glows/accent
        personality: string,          // "Curious, gentle, radiates soft golden light"
        visualDescription: string,    // Full visual description for illustrators
        voiceNotes: string,           // Voice/dialogue direction for authors
        metadata: {
          magicalItem: string | null, // "Star-Seed Pouch"
          origin: string | null,      // Backstory/origin
          relationships: [            // Denormalized relationship hints
            { characterId: string, type: "friend" | "mentor" | "rival" | "family" }
          ]
        },
        createdAt: timestamp,
        updatedAt: timestamp
```

**Indexes:** `role`, `name`

---

### 6. `dialogueMatrix`

Tracks character dialogue interactions across pages — who speaks to whom, what they say, and in what context.

```
projects/
  {projectId}/
    dialogueMatrix/
      {dialogueId}/
        pageId: string,               // FK → manuscriptPages (where this dialogue occurs)
        speakerId: string,            // FK → characters (who is speaking)
        listenerId: string | null,    // FK → characters (who is being addressed; null = narration)
        line: string,                 // "Where do the lost stars go, little one?"
        lineNumber: number,           // Order on the page
        tone: "whisper" | "excited" | "solemn" | "curious" | "frightened" | "joyful" | "neutral",
        audioSfxBindingId: string | null, // FK → audioAssets (voice effect, chime, etc.)
        isInternalThought: boolean,   // True = internal monologue, not spoken aloud
        createdAt: timestamp
```

**Indexes:** `pageId`, `speakerId`, `listenerId`

---

### 7. `audioAssets`

Audio sound effects and ambient tracks available for binding to pages and dialogue lines.

```
projects/
  {projectId}/
    audioAssets/
      {audioId}/
        name: string,                 // "Starlight Chime"
        category: "sfx" | "ambient" | "voice_effect" | "music",
        source: "procedural" | "upload",  // Generated via Web Audio API or user-uploaded file
        proceduralConfig: {           // Only for source: "procedural"
          type: "sine" | "triangle" | "noise_brown" | "noise_pink" | "bell_chord",
          frequency: number | null,
          durationMs: number,
          envelope: {
            attack: number,
            decay: number,
            sustain: number,
            release: number
          }
        } | null,
        storageUrl: string | null,    // Only for source: "upload" — cloud storage URL
        volumeDefault: number,        // 0.0 – 1.0
        emoji: string,                // "✨"
        createdAt: timestamp
```

**Indexes:** `category`

---

## Entity Relationship Diagram

```
users (1) ────< (N) projects
                      │
                      ├──< (N) storyboardNodes
                      │       └── linkedPageIds ──> manuscriptPages
                      │       └── linkedCharacterIds ──> characters
                      │
                      ├──< (N) manuscriptPages
                      │       └── selectedCharacterIds ──> characters
                      │       └── audioSfxBindingId ──> audioAssets
                      │       └── dialogueSnapshotIds ──> dialogueMatrix
                      │
                      ├──< (N) characters
                      │       └── metadata.relationships[].characterId ──> characters (self-ref)
                      │
                      ├──< (N) dialogueMatrix
                      │       └── speakerId ──> characters
                      │       └── listenerId ──> characters
                      │       └── pageId ──> manuscriptPages
                      │       └── audioSfxBindingId ──> audioAssets
                      │
                      └──< (N) audioAssets
```

---

## Migration Path: localStorage → Production

### Current State (localStorage)
Single key `pagecraft_project` holding one project with embedded pages, characters, and milestones.

### Phase 1 Migration (Single User, Single Project)
1. Create user document in `users/`
2. Copy `metadata` → `projects/{id}/metadata`
3. Copy `pages[]` → `manuscriptPages/` (one doc per page)
4. Copy `metadata.milestones` → `projects/{id}/milestones`
5. Initialize empty `characters/`, `storyboardNodes/`, `dialogueMatrix/`, `audioAssets/`

### Phase 2 Migration (Multi-Project)
1. Add project list to user profile
2. Project switcher UI
3. Clone/duplicate project functionality

### Phase 3 Migration (Collaboration)
1. Add `collaborators[]` to projects (array of userIds)
2. Real-time sync for multi-user editing
3. Comment/annotation system on manuscript pages

---

## Firestore Implementation Notes

### Security Rules Structure
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /projects/{projectId} {
      allow read, write: if request.auth.uid == resource.data.ownerId;
    }
    // Subcollections inherit project-level rules
  }
}
```

### Recommended Compound Indexes
- `manuscriptPages`: `projectId` + `pageNumber` (ascending)
- `dialogueMatrix`: `projectId` + `pageId` (ascending)
- `characters`: `projectId` + `role`

---

## Supabase (Postgres) Implementation Notes

### Table Definitions
All subcollections become tables with a `project_id` foreign key:

```sql
CREATE TABLE manuscript_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  page_type TEXT DEFAULT 'story',
  title TEXT,
  text_content TEXT DEFAULT '',
  visual_description TEXT DEFAULT '',
  illustration_status TEXT DEFAULT 'not-started',
  notes TEXT DEFAULT '',
  selected_character_ids UUID[] DEFAULT '{}',
  audio_sfx_binding_id UUID REFERENCES audio_assets(id),
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, page_number)
);
```

### Row-Level Security
```sql
ALTER TABLE manuscript_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner access" ON manuscript_pages
  USING (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()));
```

---

## MongoDB Implementation Notes

### Collection Mapping
| MongoDB Collection | Equivalent |
|---------------------|------------|
| `users` | Root collection |
| `projects` | Root collection |
| `storyboard_nodes` | Embedded array in `projects` or separate collection |
| `manuscript_pages` | Separate collection (recommended for >100 pages) |
| `characters` | Separate collection |
| `dialogue_matrix` | Separate collection |
| `audio_assets` | Separate collection |

### Sample Document (Project with embedded nodes)
```json
{
  "_id": "proj_pageboard_001",
  "ownerId": "user_id_0919",
  "metadata": { ... },
  "storyboardNodes": [
    { "id": 1, "title": "The Spark", "type": "Beginning", "coordinates": { "x": 80, "y": 200 } }
  ]
}
```

---

## Summary

| Collection | Purpose | Estimated growth |
|------------|---------|-----------------|
| `users` | Author/organization profiles | Linear (1 per user) |
| `projects` | Storybook project containers | Linear (few per user) |
| `storyboardNodes` | Visual plot outline | Small (5–30 per project) |
| `manuscriptPages` | Page content & illustration tracking | Medium (24–48 per book) |
| `characters` | Character profiles & metadata | Small (3–15 per project) |
| `dialogueMatrix` | Character dialogue tracking | Medium (1–5 per page) |
| `audioAssets` | Sound effects & ambient tracks | Small (10–30 per project) |
