#!/bin/bash
# ============================================================
# GameHub - Fix Server Maven + JDK 17 Configuration
# ============================================================
# Usage:   bash setup_maven.sh
# ============================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

echo "=========================================="
echo "  Fixing Maven + JDK 17 for GameHub"
echo "=========================================="
echo ""

# ============================================================
# 1. Find JDK 17
# ============================================================
echo "--- 1/5 Find JDK 17 ---"

JAVA17_DIR=""
for d in /usr/lib/jvm/java-17-* /usr/lib/jvm/jdk-17-* /usr/java/jdk-17-*; do
    if [ -f "$d/bin/javac" ]; then
        JAVA17_DIR="$d"
        break
    fi
done

# Fallback: search
if [ -z "$JAVA17_DIR" ]; then
    JAVA17_DIR=$(dirname $(dirname $(readlink -f $(which javac 2>/dev/null) 2>/dev/null) 2>/dev/null) 2>/dev/null)
fi

# Still not found - install
if [ -z "$JAVA17_DIR" ] || [ ! -f "$JAVA17_DIR/bin/javac" ]; then
    warn "JDK 17 not found, installing..."
    sudo dnf install -y java-17-openjdk-devel
    for d in /usr/lib/jvm/java-17-*; do
        if [ -f "$d/bin/javac" ]; then JAVA17_DIR="$d"; break; fi
    done
fi

echo "JDK 17 path: $JAVA17_DIR"
$JAVA17_DIR/bin/java -version 2>&1 | head -1
$JAVA17_DIR/bin/javac -version 2>&1 | head -1

# ============================================================
# 2. Set JAVA_HOME permanently
# ============================================================
echo ""
echo "--- 2/5 Set JAVA_HOME ---"

sudo tee /etc/profile.d/java17.sh > /dev/null <<EOF
export JAVA_HOME=$JAVA17_DIR
export PATH=\$JAVA_HOME/bin:\$PATH
EOF

source /etc/profile.d/java17.sh
export JAVA_HOME=$JAVA17_DIR
export PATH=$JAVA_HOME/bin:$PATH

log "JAVA_HOME set to $JAVA17_DIR"

# ============================================================
# 3. Install fresh Maven (use system if JDK-compatible)
# ============================================================
echo ""
echo "--- 3/5 Install Maven ---"

# Remove broken system maven if any
sudo dnf remove -y maven 2>/dev/null || true

# Download standalone Maven 3.9.9
MAVEN_VERSION="3.9.9"
MAVEN_DIR="/opt/maven"
MAVEN_URL="https://dlcdn.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz"

if [ ! -d "$MAVEN_DIR" ]; then
    echo "  Downloading Maven $MAVEN_VERSION..."
    curl -fsSL "$MAVEN_URL" -o /tmp/maven.tar.gz || \
    wget -q "$MAVEN_URL" -O /tmp/maven.tar.gz

    sudo mkdir -p /opt
    sudo tar -xzf /tmp/maven.tar.gz -C /opt
    sudo mv /opt/apache-maven-* "$MAVEN_DIR" 2>/dev/null || true
    rm -f /tmp/maven.tar.gz
fi

log "Maven installed at $MAVEN_DIR"

# ============================================================
# 4. Create maven.sh profile
# ============================================================
echo ""
echo "--- 4/5 Create Maven profile ---"

sudo tee /etc/profile.d/maven.sh > /dev/null <<EOF
export MAVEN_HOME=$MAVEN_DIR
export M2_HOME=$MAVEN_DIR
export PATH=\$MAVEN_HOME/bin:\$PATH
EOF

source /etc/profile.d/maven.sh
export MAVEN_HOME=$MAVEN_DIR
export PATH=$MAVEN_HOME/bin:$PATH

log "Maven profile created"

# ============================================================
# 5. Verify
# ============================================================
echo ""
echo "--- 5/5 Verify ---"

export JAVA_HOME=$JAVA17_DIR
export PATH=$JAVA_HOME/bin:$MAVEN_DIR/bin:$PATH

echo ""
echo "Java:"
java -version 2>&1 | head -1

echo ""
echo "Javac:"
javac -version 2>&1 | head -1

echo ""
echo "Maven:"
$MAVEN_DIR/bin/mvn --version 2>&1 | head -3

echo ""
echo "=========================================="
echo -e "${GREEN}  Maven + JDK 17 configured!${NC}"
echo "=========================================="
echo ""
echo "Now run this EXACT command to build:"
echo ""
echo -e "  ${GREEN}export JAVA_HOME=$JAVA17_DIR${NC}"
echo -e "  ${GREEN}export PATH=\$JAVA_HOME/bin:$MAVEN_DIR/bin:\$PATH${NC}"
echo -e "  ${GREEN}cd /home/user/game-hub/backend && mvn clean package -DskipTests${NC}"
echo ""
echo "Or log out and back in for permanent effect."
