param(
    [string]$InputDir = ".",
    [string]$OutputDir = "public/audio/operator",
    [switch]$TacticalCommsLight
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    throw "ffmpeg was not found in PATH."
}
if (-not (Get-Command ffprobe -ErrorAction SilentlyContinue)) {
    throw "ffprobe was not found in PATH."
}

$comments = @(
    "Initialization sequence complete. Welcome back, Raven.",
    "Neural link stabilized. Feeling any feedback in your nerves?",
    "Your vitals are steady. As always. It's almost intimidating.",
    "The vector field is messy today. Keep your eyes peeled.",
    "That heavy laser looks good on you. Very... dominant.",
    "Try not to overheat the core. I hate filing those repair reports.",
    "Target sighted. Show me that 98% accuracy again, okay?",
    "Beautiful shot. You're making this look way too easy.",
    "Enemy signal neutralized. You didn't even break a sweat.",
    "Is it hot in the cockpit, or is it just me watching the feed?",
    "Focus, Raven. Don't let my chatter distract you too much.",
    "Movement is fluid. Your sync rate is literally off the charts.",
    "I've cleared the secondary channel. It's just us now.",
    "Did you get my message about the post-mission drink?",
    "You're glowing on the radar. Literally and figuratively.",
    "Multiple signatures detected. Give 'em hell, Cowboy.",
    "I spent all night calibrating your aim. Don't waste it.",
    "You're the only pilot who can handle this much kickback.",
    "Stay safe out there. I don't want to lose my favorite asset.",
    "Ever visited the Tannhauser Gate? My hometown is just a sector away.",
    "Target terminated. Clean. I love how you handle that trigger.",
    "Energy levels at 40%. Don't get reckless on me now.",
    "I'm recording this session... for ""tactical review."" And my private collection.",
    "You done? I've got the debriefing room ready. Just for two.",
    "System idling. Come back soon, Raven. I'll be waiting right here."
)

if ($comments.Count -ne 25) {
    throw "Expected 25 comments, got $($comments.Count)."
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$filters = @()
if ($TacticalCommsLight.IsPresent) {
    # Stronger "radio-AI" profile with stable output level.
    $filters += "highpass=f=360"
    $filters += "lowpass=f=3000"
    $filters += "equalizer=f=1700:t=q:w=1.0:g=2.5"
    $filters += "equalizer=f=2400:t=q:w=1.0:g=2.8"
    $filters += "equalizer=f=2950:t=q:w=1.4:g=-2.5"
    $filters += "acrusher=bits=8:mode=lin:mix=0.45"
    $filters += "acompressor=threshold=-24dB:ratio=3:attack=8:release=110:makeup=10"
    $filters += "volume=-6dB"
    $filters += "alimiter=limit=0.891"
} else {
    $filters += "highpass=f=80"
    $filters += "deesser=i=0.35:m=0.5:f=0.6"
    $filters += "equalizer=f=7500:t=q:w=1.2:g=-3"
    $filters += "equalizer=f=3200:t=q:w=1.1:g=1.5"
    $filters += "acompressor=threshold=-18dB:ratio=2:attack=15:release=90:makeup=2"
    $filters += "alimiter=limit=0.891"
}
$filterChain = [string]::Join(",", $filters)

$clips = @()

for ($i = 1; $i -le 25; $i++) {
    $id = "{0:D2}" -f $i
    $inputPath = Join-Path $InputDir "$id.wav"
    if (-not (Test-Path $inputPath)) {
        throw "Missing source file: $inputPath"
    }

    $webmPath = Join-Path $OutputDir "$id.webm"
    $m4aPath = Join-Path $OutputDir "$id.m4a"

    & ffmpeg -y -hide_banner -loglevel error `
        -i $inputPath `
        -vn -ac 1 -ar 24000 `
        -af $filterChain `
        -c:a libopus -b:a 28k -vbr on -compression_level 10 -application voip `
        $webmPath
    if ($LASTEXITCODE -ne 0) {
        throw "ffmpeg failed for WebM output: $inputPath"
    }

    & ffmpeg -y -hide_banner -loglevel error `
        -i $inputPath `
        -vn -ac 1 -ar 24000 `
        -af $filterChain `
        -c:a aac -b:a 48k `
        $m4aPath
    if ($LASTEXITCODE -ne 0) {
        throw "ffmpeg failed for M4A output: $inputPath"
    }

    $durationSec = (& ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $webmPath)
    if (-not $durationSec) {
        $durationSec = (& ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $m4aPath)
    }
    $durationMs = [int][math]::Round(([double]$durationSec) * 1000)

    $webmBytes = (Get-Item $webmPath).Length
    $m4aBytes = (Get-Item $m4aPath).Length

    $clips += [ordered]@{
        index = $i - 1
        id = "operator-voice-$id"
        text = $comments[$i - 1]
        sources = [ordered]@{
            webm = "/audio/operator/$id.webm"
            m4a = "/audio/operator/$id.m4a"
        }
        durationMs = $durationMs
        volume = 0.3
        bytes = [ordered]@{
            webm = $webmBytes
            m4a = $m4aBytes
        }
    }
}

$manifest = [ordered]@{
    generatedAt = (Get-Date).ToString("o")
    source = "root-wav-01-to-25"
    target = [ordered]@{
        channels = 1
        sampleRate = 24000
        opusBitrate = "28k"
        aacBitrate = "48k"
        tacticalCommsLight = [bool]$TacticalCommsLight.IsPresent
    }
    clips = $clips
}

$manifestPath = Join-Path $OutputDir "manifest.json"
$manifest | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 $manifestPath

$oversized = $clips | Where-Object { $_.bytes.webm -gt 92160 }
$avgWebmBytes = $clips | ForEach-Object { [double]$_.bytes.webm }
$avgWebm = [int][math]::Round((($avgWebmBytes | Measure-Object -Average).Average), 0)

Write-Host "Done. Generated 25 mastered voice clips in '$OutputDir'."
Write-Host "Average WebM size: $avgWebm bytes."
if ($oversized.Count -gt 0) {
    Write-Host "Warning: $($oversized.Count) clip(s) exceed 90KB WebM target."
}
