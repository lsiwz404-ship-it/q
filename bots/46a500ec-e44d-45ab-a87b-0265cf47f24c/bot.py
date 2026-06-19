import discord
from discord.ext import commands
import yt_dlp
import asyncio

# إعدادات الصلاحيات (Intents)
intents = discord.Intents.default()
intents.message_content = True
intents.voice_states = True 

# تحديد البادئة (Prefix) للأوامر
bot = commands.Bot(command_prefix='!', intents=intents)

# ----------------- الإعدادات -----------------
VOICE_CHANNEL_ID = 1472448365693370542  # أيدي الروم الصوتي
NEWS_CHANNEL_ID = 1471109757514547210   # أيدي روم الأخبار
# ---------------------------------------------

# إعدادات مشغل اليوتيوب
ytdl_format_options = {
    'format': 'bestaudio/best',
    'outtmpl': '%(extractor)s-%(id)s-%(title)s.%(ext)s',
    'restrictfilenames': True,
    'noplaylist': True,
    'nocheckcertificate': True,
    'ignoreerrors': False,
    'logtostderr': False,
    'quiet': True,
    'no_warnings': True,
    'default_search': 'auto',
    'source_address': '0.0.0.0'
}
ytdl = yt_dlp.YoutubeDL(ytdl_format_options)

@bot.event
async def on_ready():
    print(f'✅ Logged in successfully as {bot.user}')
    
    # الدخول التلقائي مع (Deafen)
    voice_channel = bot.get_channel(VOICE_CHANNEL_ID)
    if voice_channel and isinstance(voice_channel, discord.VoiceChannel):
        try:
            await voice_channel.connect(self_deaf=True)
            print(f'🔊 Connected to voice channel: {voice_channel.name} (Deafened)')
        except Exception as e:
            print(f'⚠️ Could not connect to voice channel: {e}')

# ميزة البقاء للأبد: إذا أحد طرد البوت أو فصل، يرجع تلقائي
@bot.event
async def on_voice_state_update(member, before, after):
    # نتحقق إذا العضو هو البوت، وإذا كان في روم وطلع منه
    if member == bot.user and before.channel is not None and after.channel is None:
        await asyncio.sleep(3) # ينتظر 3 ثواني
        try:
            await before.channel.connect(self_deaf=True) # يرجع يدخل مع ديفن
            print("🔄 تم إعادة الدخول للروم الصوتي تلقائياً.")
        except:
            pass

# 1. أمر استدعاء البوت
@bot.command(name='تعال')
async def join(ctx):
    if not ctx.message.author.voice:
        await ctx.send("❌ لازم تكون داخل روم صوتي عشان أقدر أجيك.")
        return
    
    channel = ctx.message.author.voice.channel
    if ctx.voice_client:
        await ctx.voice_client.move_to(channel)
        await ctx.send(f"🏃‍♂️ جيتك في روم: **{channel.name}**")
    else:
        await channel.connect(self_deaf=True)
        await ctx.send(f"🔊 دخلت روم: **{channel.name}** (وأنا مسوي ديفن)")

# 2. أمر الأخبار
@bot.command(name='news')
@commands.has_permissions(administrator=True)
async def send_news(ctx, *, text: str = None):
    target_channel = bot.get_channel(NEWS_CHANNEL_ID)
    if not target_channel:
        await ctx.send("❌ لم أتمكن من العثور على روم الأخبار.")
        return

    files = []
    if ctx.message.attachments:
        for attachment in ctx.message.attachments:
            files.append(await attachment.to_file())

    if text or files:
        await target_channel.send(content=text, files=files)
        await ctx.send("✅ تم إرسال الخبر بنجاح!", delete_after=5)
        await ctx.message.delete()
    else:
        await ctx.send("⚠️ الرجاء كتابة نص أو إرفاق صورة مع الأمر.")

# 3. أمر تشغيل الصوتيات
@bot.command(name='ش')
async def play(ctx, *, query: str):
    voice_client = ctx.voice_client
    if not voice_client:
        await ctx.send("❌ البوت مو في روم صوتي! اكتب `!تعال` أول.")
        return

    if voice_client.is_playing():
        voice_client.stop()

    msg = await ctx.send(f"⏳ جاري البحث والتجهيز...")

    try:
        loop = asyncio.get_event_loop()
        data = await loop.run_in_executor(None, lambda: ytdl.extract_info(query, download=False))
        if 'entries' in data:
            data = data['entries'][0]

        song_url = data['url']
        title = data['title']

        # خيارات احترافية لمنع تقطيع الصوت
        ffmpeg_opts = {
            'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5',
            'options': '-vn'
        }

        voice_client.play(discord.FFmpegPCMAudio(song_url, **ffmpeg_opts))
        await msg.edit(content=f"🎶 يتم الآن تشغيل: **{title}**")
        
    except Exception as e:
        # خلينا الخطأ يطبع في الديسكورد عشان نعرف المشكلة لو تكررت
        await msg.edit(content=f"❌ حدث خطأ: \n`{str(e)}`\n*(ملاحظة: إذا تشغل البوت من جهازك الويندوز، تأكد من تثبيت FFmpeg، أو ارفع البوت على Discloud وبيشتغل طبيعي)*")
        print(e)

# 4. أمر الإيقاف
@bot.command(name='قف')
async def stop(ctx):
    if ctx.voice_client and ctx.voice_client.is_playing():
        ctx.voice_client.stop()
        await ctx.send("⏹️ تم إيقاف التشغيل.")

# حط التوكن حقك هنا
bot.run('MTQ4NDAwNTQyNDc1ODkxNTE1OA.GNOOGY.y0ewd6n4B9fqpHey7JiqRpyG2AxWtU3mOg56_A')