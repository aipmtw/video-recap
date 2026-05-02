# Requirement: YouTube Video Recap App

Build a simple web app for collecting and publishing key notes from selected YouTube videos.

## Goal

I have some high-quality YouTube videos. I want to create Traditional Chinese recap notes for each video, then publish them as readable pages.

## Content Format

Each recap page should be written in Traditional Chinese.

Each recap should include:

- Video title
- YouTube URL
- Published recap date
- Short summary
- Key takeaways
- Important quotes or ideas
- Actionable notes
- Optional personal comments

## URL Structure

Each recap page should use this URL format:

```text
/video-recap/{yyyy-mm}-{slug}

Example:

/video-recap/2026-05-ai-agent-production-showcase

Where:

yyyy-mm = year and month of the recap
slug = English lowercase URL-friendly slug
Use hyphens instead of spaces
Keep slug short but meaningful
Homepage

The homepage should act as the index page.

It should list all video recap articles, sorted by newest first.

Each item should show:

Recap title
YouTube source/channel if available
Short description
Date
Link to the recap page
Custom Route

Create a custom route:

/video-recap

This page should be the archive/index page for all video recaps.

Expected Pages
/                         → Homepage index
/video-recap              → Video recap archive
/video-recap/{yyyy-mm}-{slug} → Individual recap page
Content Storage

Use a simple content-driven structure.

Preferred:

/content/video-recap/
  2026-05-ai-agent-production-showcase.md
  2026-05-claude-code-workflow.md

Each markdown file should contain frontmatter:

title: "影片標題"
youtube_url: "https://www.youtube.com/watch?v=xxxx"
channel: "Channel Name"
date: "2026-05-02"
slug: "2026-05-ai-agent-production-showcase"
summary: "這支影片的簡短摘要"
Design Requirements
Clean reading layout
Mobile-friendly
Traditional Chinese typography
Homepage and archive should be easy to scan
Individual recap page should be optimized for long-form reading
Implementation Notes
Build the routing first
Add one sample recap page
Make sure /video-recap works
Make sure individual recap URLs work
Do not overbuild CMS features yet

Small correction:

> `/video-recap ulr as custom cmd`

Better English:

> **I expect `/video-recap` to be a custom URL route.**

Or more natural:

> **Please create `/video-recap` as a custom route for the video recap index.**