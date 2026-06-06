# ============================================================
# GameHub - Windows Server Environment Installer
# ============================================================
# Requires: Windows Server 2019+ / Windows 10/11
# Run as:   PowerShell (Administrator)
# Usage:    .\install_server_windows.ps1
# ============================================================

param(
    [string]$InstallDrive = "C:",
    [string]$MySQLPassword = "Root@123456"
)

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "GameHub Server Installer"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  GameHub - Windows Server Installer" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check admin
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Please run this script as Administrator!" -ForegroundColor Red
    pause
    exit 1
}

# ============================================================
# Helper functions
# ============================================================
function Write-Step($msg) {
    Write-Host ""; Write-Host "--- $msg ---" -ForegroundColor Yellow
}

function Write-OK($msg) {
    Write-Host "[OK] $msg" -ForegroundColor Green
}

function Write-Warn($msg) {
    Write-Host "[!] $msg" -ForegroundColor Magenta
}

function Download-File($url, $dest) {
    Write-Host "  Downloading: $url"
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $wc = New-Object System.Net.WebClient
        $wc.DownloadFile($url, $dest)
        Write-OK "Downloaded to $dest"
    } catch {
        Write-Warn "Download failed: $_"
        return $false
    }
    return $true
}

# ============================================================
# 1. Install JDK 17
# ============================================================
Write-Step "1/5 Installing JDK 17"

$JAVA_HOME = "$InstallDrive\Java\jdk-17"

if (Test-Path "$JAVA_HOME\bin\java.exe") {
    Write-OK "JDK 17 already installed at $JAVA_HOME"
} else {
    $JDK_URL = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk"
    $JDK_ZIP = "$env:TEMP\jdk17.zip"

    if (-not (Download-File $JDK_URL $JDK_ZIP)) {
        # Fallback mirrors
        $mirrors = @(
            "https://mirrors.huaweicloud.com/openjdk/17.0.2+8/OpenJDK-17.0.2+8_windows-x64_bin.zip",
            "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10+7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.10_7.zip"
        )
        foreach ($mirror in $mirrors) {
            if (Download-File $mirror $JDK_ZIP) { break }
        }
    }

    if (Test-Path $JDK_ZIP) {
        Write-Host "  Extracting JDK to $JAVA_HOME..."
        New-Item -ItemType Directory -Force -Path $JAVA_HOME | Out-Null
        Expand-Archive -Path $JDK_ZIP -DestinationPath $env:TEMP\jdk_extract -Force
        $extracted = Get-ChildItem $env:TEMP\jdk_extract | Select-Object -First 1
        Copy-Item -Path "$($extracted.FullName)\*" -Destination $JAVA_HOME -Recurse -Force
        Remove-Item $JDK_ZIP -Force
        Remove-Item $env:TEMP\jdk_extract -Recurse -Force
        Write-OK "JDK 17 installed"
    } else {
        Write-Warn "Could not download JDK. Please install manually from https://adoptium.net/"
    }
}

# Set JAVA_HOME
[Environment]::SetEnvironmentVariable("JAVA_HOME", $JAVA_HOME, "Machine")
$env:JAVA_HOME = $JAVA_HOME
$env:Path = "$JAVA_HOME\bin;$env:Path"

# ============================================================
# 2. Install MySQL 8.0
# ============================================================
Write-Step "2/5 Installing MySQL 8.0"

$MYSQL_HOME = "$InstallDrive\MySQL"

if (Test-Path "$MYSQL_HOME\bin\mysql.exe") {
    Write-OK "MySQL already installed at $MYSQL_HOME"
} else {
    $MYSQL_URL = "https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.36-winx64.zip"
    $MYSQL_ZIP = "$env:TEMP\mysql.zip"

    # Try multiple mirrors
    $mirrors = @(
        $MYSQL_URL,
        "https://mirrors.huaweicloud.com/mysql/Downloads/MySQL-8.0/mysql-8.0.36-winx64.zip",
        "https://cdn.mysql.com/Downloads/MySQL-8.0/mysql-8.0.36-winx64.zip"
    )
    foreach ($m in $mirrors) {
        if (Download-File $m $MYSQL_ZIP) { break }
    }

    if (Test-Path $MYSQL_ZIP) {
        Write-Host "  Extracting MySQL to $MYSQL_HOME..."
        Expand-Archive -Path $MYSQL_ZIP -DestinationPath $env:TEMP\mysql_extract -Force
        $extracted = Get-ChildItem $env:TEMP\mysql_extract | Select-Object -First 1
        Move-Item -Path $extracted.FullName -Destination $MYSQL_HOME -Force
        Remove-Item $MYSQL_ZIP -Force
        Remove-Item $env:TEMP\mysql_extract -Recurse -Force -ErrorAction SilentlyContinue
    }
}

if (Test-Path "$MYSQL_HOME\bin\mysql.exe") {
    # Initialize MySQL if not already
    $dataDir = "$MYSQL_HOME\data"
    if (-not (Test-Path "$dataDir\mysql")) {
        Write-Host "  Initializing MySQL data directory..."
        & "$MYSQL_HOME\bin\mysqld.exe" --initialize-insecure --datadir="$dataDir" 2>&1 | Out-Null
    }

    # Create my.ini
    $myIni = @"
[mysqld]
basedir=$($MYSQL_HOME -replace '\\','\\')
datadir=$($dataDir -replace '\\','\\')
port=3306
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
default_authentication_plugin=mysql_native_password

[client]
default-character-set=utf8mb4

[mysql]
default-character-set=utf8mb4
"@
    [System.IO.File]::WriteAllText("$MYSQL_HOME\my.ini", $myIni, [System.Text.UTF8Encoding]::new($false))

    # Install & start service
    $svc = Get-Service -Name "MySQL" -ErrorAction SilentlyContinue
    if (-not $svc) {
        & "$MYSQL_HOME\bin\mysqld.exe" --install MySQL 2>&1 | Out-Null
        Start-Service MySQL
        Write-OK "MySQL service installed and started"
    } else {
        if ($svc.Status -ne "Running") {
            Start-Service MySQL
        }
        Write-OK "MySQL service running"
    }

    # Create database
    $env:MYSQL_PWD = $MySQLPassword
    $mysqlBin = "$MYSQL_HOME\bin\mysql.exe"

    # Set root password
    & $mysqlBin -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MySQLPassword'; FLUSH PRIVILEGES;" 2>$null

    # Create gamehub database
    & $mysqlBin -u root -e "CREATE DATABASE IF NOT EXISTS gamehub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null

    Write-OK "Database 'gamehub' created"
}
else {
    Write-Warn "MySQL installation failed. Please install manually from https://dev.mysql.com/downloads/"
}

# ============================================================
# 3. Install Maven
# ============================================================
Write-Step "3/5 Installing Maven"

$MAVEN_HOME = "$InstallDrive\Maven\apache-maven-3.9.9"

if (Test-Path "$MAVEN_HOME\bin\mvn.cmd") {
    Write-OK "Maven already installed at $MAVEN_HOME"
} else {
    $MVN_URL = "https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip"
    $MVN_ZIP = "$env:TEMP\maven.zip"

    $mirrors = @(
        $MVN_URL,
        "https://mirrors.huaweicloud.com/apache/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip"
    )
    foreach ($m in $mirrors) {
        if (Download-File $m $MVN_ZIP) { break }
    }

    if (Test-Path $MVN_ZIP) {
        New-Item -ItemType Directory -Force -Path "$InstallDrive\Maven" | Out-Null
        Expand-Archive -Path $MVN_ZIP -DestinationPath "$InstallDrive\Maven" -Force
        Remove-Item $MVN_ZIP -Force
        Write-OK "Maven installed"
    }
}

# Set MAVEN_HOME
[Environment]::SetEnvironmentVariable("MAVEN_HOME", $MAVEN_HOME, "Machine")
$env:MAVEN_HOME = $MAVEN_HOME
$env:Path = "$MAVEN_HOME\bin;$env:Path"

# ============================================================
# 4. Install FFmpeg (optional)
# ============================================================
Write-Step "4/5 Installing FFmpeg"

$FFMPEG_HOME = "$InstallDrive\FFmpeg"

if (Test-Path "$FFMPEG_HOME\bin\ffmpeg.exe") {
    Write-OK "FFmpeg already installed at $FFMPEG_HOME"
} else {
    $FFMPEG_URL = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
    $FFMPEG_ZIP = "$env:TEMP\ffmpeg.zip"

    if (Download-File $FFMPEG_URL $FFMPEG_ZIP) {
        New-Item -ItemType Directory -Force -Path "$InstallDrive\FFmpeg" | Out-Null
        Expand-Archive -Path $FFMPEG_ZIP -DestinationPath $env:TEMP\ffmpeg_extract -Force
        $extracted = Get-ChildItem $env:TEMP\ffmpeg_extract | Where-Object { $_.Name -like "ffmpeg-*" } | Select-Object -First 1
        if ($extracted) {
            Copy-Item -Path "$($extracted.FullName)\*" -Destination $FFMPEG_HOME -Recurse -Force
        }
        Remove-Item $FFMPEG_ZIP -Force
        Remove-Item $env:TEMP\ffmpeg_extract -Recurse -Force -ErrorAction SilentlyContinue
        Write-OK "FFmpeg installed"
    } else {
        Write-Warn "FFmpeg download failed (non-critical). HLS transcoding will not be available."
    }
}

$env:Path = "$FFMPEG_HOME\bin;$env:Path"

# ============================================================
# 5. Install Nginx (optional)
# ============================================================
Write-Step "5/5 Installing Nginx"

$NGINX_HOME = "$InstallDrive\Nginx"

if (Test-Path "$NGINX_HOME\nginx.exe") {
    Write-OK "Nginx already installed at $NGINX_HOME"
} else {
    Write-Warn "Nginx for Windows must be installed manually."
    Write-Host "  Download from: https://nginx.org/en/download.html" -ForegroundColor Gray
    Write-Host "  Extract to: $NGINX_HOME" -ForegroundColor Gray
}

# ============================================================
# Update PATH
# ============================================================
Write-Step "Updating System PATH"
$paths = @(
    "$JAVA_HOME\bin",
    "$MYSQL_HOME\bin",
    "$MAVEN_HOME\bin",
    "$FFMPEG_HOME\bin"
)

$machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
foreach ($p in $paths) {
    if (Test-Path $p) {
        if ($machinePath -notlike "*$p*") {
            $machinePath = "$machinePath;$p"
        }
    }
}
[Environment]::SetEnvironmentVariable("Path", $machinePath, "Machine")
$env:Path = $machinePath

# ============================================================
# Create upload directory
# ============================================================
Write-Step "Creating upload directories"
$uploadDir = "$InstallDrive\gamehub\uploads\videos"
New-Item -ItemType Directory -Force -Path "$uploadDir\original" | Out-Null
New-Item -ItemType Directory -Force -Path "$uploadDir\hls" | Out-Null
Write-OK "Upload directories created at $uploadDir"

# ============================================================
# Summary
# ============================================================
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Installed Software:" -ForegroundColor Cyan
try { Write-Host "  JDK     : $(java -version 2>&1 | Select-Object -First 1)" } catch {}
try { Write-Host "  MySQL   : $(mysql --version 2>&1)" } catch {}
try { Write-Host "  Maven   : $(mvn --version 2>&1 | Select-Object -First 1)" } catch {}
try { Write-Host "  FFmpeg  : $(ffmpeg -version 2>&1 | Select-Object -First 1)" } catch {}
Write-Host ""

Write-Host "Database:" -ForegroundColor Cyan
Write-Host "  Host    : localhost:3306"
Write-Host "  DB Name : gamehub"
Write-Host "  User    : root"
Write-Host "  Password: $MySQLPassword"
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Restart your terminal for PATH changes to take effect"
Write-Host "  2. cd E:\game-hub\backend && mvn spring-boot:run"
Write-Host "  3. Open frontend\index.html in browser"
Write-Host ""

Write-Host "Security Reminders:" -ForegroundColor Red
Write-Host "  - Change MySQL root password in production"
Write-Host "  - Change JWT secret in application-prod.yml"
Write-Host "  - Configure Windows Firewall to block port 8080 from external access"
Write-Host ""

Read-Host "Press Enter to exit"
