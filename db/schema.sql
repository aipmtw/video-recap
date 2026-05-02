-- Azure SQL schema for video-recap
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'recaps')
BEGIN
  CREATE TABLE dbo.recaps (
    slug              NVARCHAR(200) NOT NULL PRIMARY KEY,
    title             NVARCHAR(400) NOT NULL,
    youtube_url       NVARCHAR(500) NOT NULL,
    channel           NVARCHAR(200) NULL,
    recap_date        DATE          NOT NULL,
    summary           NVARCHAR(MAX) NOT NULL,
    key_takeaways     NVARCHAR(MAX) NULL,   -- JSON array of strings
    quotes            NVARCHAR(MAX) NULL,   -- JSON array of strings
    actionable_notes  NVARCHAR(MAX) NULL,   -- JSON array of strings
    personal_comments NVARCHAR(MAX) NULL,
    created_at        DATETIME2     NOT NULL CONSTRAINT DF_recaps_created DEFAULT SYSUTCDATETIME(),
    updated_at        DATETIME2     NOT NULL CONSTRAINT DF_recaps_updated DEFAULT SYSUTCDATETIME()
  );

  CREATE INDEX IX_recaps_recap_date ON dbo.recaps (recap_date DESC);
END;
