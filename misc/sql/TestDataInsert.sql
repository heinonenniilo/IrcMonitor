    Use IrcMonitorDb

    BEGIN TRY
    BEGIN TRAN

    if ( NOT EXISTS(SELECT * FROM IrcChannels C where C.Name = 'Channel1')  )
    BEGIN
        insert into IrcChannels (Name)
	        select 'Channel1'
    END

    if ( NOT EXISTS(SELECT * FROM IrcChannels C where C.Name = 'Channel2') )
    BEGIN

        insert into IrcChannels (Name)
	        select 'Channel2'
    END

    if ( NOT EXISTS(SELECT * FROM IrcChannels C where C.Name = 'Channel3') )
    BEGIN

        insert into IrcChannels (Name)
	        select 'Channel3'
    END

    DECLARE @Looper int = 0
    DECLARE @channelId INT
    declare @nicks table (
        nick nvarchar(100)
    )
    insert into @nicks 
        select 'QWE'

    insert into @nicks 
        select 'RTY'

    insert into @nicks 
        select 'UIO'

    insert into @nicks 
        select 'ASD'

    insert into @nicks 
        select 'FGH'


    SET @Looper = 8*365
    WHILE @Looper > 0

    BEGIN

        DECLARE @date DATE = GETDATE()
        set @date = DATEADD(day, -1*@Looper, @date)

        DECLARE @amountToInsert int = rand()*300
        DECLARE @InnerLooper INT = 0

        WHILE @InnerLooper < @amountToInsert
        BEGIN
            set @channelId = (select top 1 id from IrcChannels c order by NEWID())
            print 'Channel ID:'
            print @channelId
            insert into IrcRows (Message, Nick, TimeStamp, ChannelId)
                select convert(nvarchar(100), newid()), (select top 1 nick from @nicks order by NEWID()), DATEADD(minute, 1440*rand(), cast(@date as datetime)), @channelId
            set @InnerLooper = @InnerLooper +1
        END

        print 'Inserted a set of rows'
        print @Looper
        set @Looper = @Looper - 1
    END
        COMMIT TRAN
    END TRY
    BEGIN CATCH
        PRINT 'In CATCH Block'
        IF(@@TRANCOUNT > 0)
            ROLLBACK TRAN;

        THROW; 
    END CATCH


