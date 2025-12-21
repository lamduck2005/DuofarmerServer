const readline = require('readline');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Axios instance
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  },
});

// JWT Utilities
function decodeJwt(jwtToken) {
  try {
    const decoded = jwt.decode(jwtToken);
    if (!decoded || !decoded.sub) {
      throw new Error('Invalid JWT token: missing sub field');
    }
    return decoded;
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error.message}`);
  }
}

function getUserId(jwtToken) {
  const decoded = decodeJwt(jwtToken);
  return decoded.sub;
}

function validateJwt(jwtToken) {
  if (!jwtToken || typeof jwtToken !== 'string') {
    throw new Error('JWT token is required and must be a string');
  }

  const decoded = decodeJwt(jwtToken);
  
  if (decoded.exp && decoded.exp < Date.now() / 1000) {
    throw new Error('JWT token has expired');
  }

  return true;
}

// Duolingo API Client
function getHeaders(jwt) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwt}`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  };
}

async function getUserInfo(userId, jwt) {
  try {
    const url = `https://www.duolingo.com/2017-06-30/users/${userId}?fields=id,username,fromLanguage,learningLanguage,streak,totalXp,level,numFollowers,numFollowing,gems,creationDate,streakData,privacySettings,currentCourse{pathSectioned{units{levels{pathLevelMetadata{skillId},pathLevelClientData{skillId}}}}}`;
    const response = await axiosInstance.get(url, {
      headers: getHeaders(jwt),
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      throw new Error(`Duolingo API error: ${status} - ${statusText}`);
    }
    throw new Error(`Failed to get user info: ${error.message}`);
  }
}

async function farmGem(userId, jwt, userInfo) {
  try {
    const rewardId = 'SKILL_COMPLETION_BALANCED-dd2495f4_d44e_3fc3_8ac8_94e2191506f0-2-GEMS';
    const url = `https://www.duolingo.com/2017-06-30/users/${userId}/rewards/${rewardId}`;
    const body = {
      consumed: true,
      learningLanguage: userInfo.learningLanguage,
      fromLanguage: userInfo.fromLanguage,
    };
    const response = await axiosInstance.patch(url, body, {
      headers: getHeaders(jwt),
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      throw new Error(`Duolingo API error: ${status} - ${statusText}`);
    }
    throw new Error(`Failed to farm gem: ${error.message}`);
  }
}

async function farmSession(userId, jwt, userInfo, config) {
  try {
    const startTime = config?.startTime ?? Math.floor(Date.now() / 1000);
    const endTime = config?.endTime ?? startTime + 60;

    const sessionPayload = {
      challengeTypes: [],
      fromLanguage: userInfo.fromLanguage,
      learningLanguage: userInfo.learningLanguage,
      type: 'GLOBAL_PRACTICE',
      ...(config.sessionPayload || {}),
    };

    const sessionResponse = await axiosInstance.post(
      'https://www.duolingo.com/2017-06-30/sessions',
      sessionPayload,
      {
        headers: getHeaders(jwt),
      },
    );

    const sessionData = sessionResponse.data;

    const updateSessionPayload = {
      id: sessionData.id,
      metadata: sessionData.metadata,
      type: sessionData.type,
      fromLanguage: userInfo.fromLanguage,
      learningLanguage: userInfo.learningLanguage,
      challenges: [],
      adaptiveChallenges: [],
      sessionExperimentRecord: [],
      experiments_with_treatment_contexts: [],
      adaptiveInterleavedChallenges: [],
      sessionStartExperiments: [],
      trackingProperties: [],
      ttsAnnotations: [],
      heartsLeft: 0,
      startTime: startTime,
      enableBonusPoints: false,
      endTime: endTime,
      failed: false,
      maxInLessonStreak: 9,
      shouldLearnThings: true,
      ...(config.updateSessionPayload || {}),
    };

    const updateResponse = await axiosInstance.put(
      `https://www.duolingo.com/2017-06-30/sessions/${sessionData.id}`,
      updateSessionPayload,
      {
        headers: getHeaders(jwt),
      },
    );

    return updateResponse.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      throw new Error(`Duolingo API error: ${status} - ${statusText}`);
    }
    throw new Error(`Failed to farm session: ${error.message}`);
  }
}

async function farmStory(userId, jwt, userInfo, config) {
  try {
    const startTime = Math.floor(Date.now() / 1000);
    const fromLanguage = userInfo.fromLanguage;
    const url = `https://stories.duolingo.com/api2/stories/en-${fromLanguage}-the-passport/complete`;

    const storyPayload = {
      awardXp: true,
      isFeaturedStoryInPracticeHub: false,
      completedBonusChallenge: true,
      mode: 'READ',
      isV2Redo: false,
      isV2Story: false,
      isLegendaryMode: true,
      masterVersion: false,
      maxScore: 0,
      numHintsUsed: 0,
      score: 0,
      startTime: startTime,
      fromLanguage: fromLanguage,
      learningLanguage: userInfo.learningLanguage,
      hasXpBoost: false,
      ...(config.storyPayload || {}),
    };

    const response = await axiosInstance.post(url, storyPayload, {
      headers: getHeaders(jwt),
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      throw new Error(`Duolingo API error: ${status} - ${statusText}`);
    }
    throw new Error(`Failed to farm story: ${error.message}`);
  }
}

// Farming Logic
function extractSkillId(currentCourse) {
  if (!currentCourse?.pathSectioned) {
    return null;
  }

  const sections = currentCourse.pathSectioned || [];
  for (const section of sections) {
    const units = section.units || [];
    for (const unit of units) {
      const levels = unit.levels || [];
      for (const level of levels) {
        const skillId =
          level.pathLevelMetadata?.skillId || level.pathLevelClientData?.skillId;
        if (skillId) {
          return skillId;
        }
      }
    }
  }
  return null;
}

function getSessionConfig(amount, skillId) {
  const configs = {
    10: {
      sessionPayload: {},
      updateSessionPayload: {},
    },
    20: {
      sessionPayload: {},
      updateSessionPayload: { hasBoost: true },
    },
    40: {
      sessionPayload: {},
      updateSessionPayload: { hasBoost: true, type: 'TARGET_PRACTICE' },
    },
    50: {
      sessionPayload: {},
      updateSessionPayload: {
        enableBonusPoints: true,
        hasBoost: true,
        happyHourBonusXp: 10,
        type: 'TARGET_PRACTICE',
      },
    },
    110: {
      sessionPayload: {
        type: 'UNIT_TEST',
        skillIds: skillId ? [skillId] : [],
      },
      updateSessionPayload: {
        type: 'UNIT_TEST',
        hasBoost: true,
        happyHourBonusXp: 10,
        pathLevelSpecifics: { unitIndex: 0 },
      },
    },
  };

  return configs[amount] || null;
}

async function farmGemWrapper(jwt) {
  try {
    validateJwt(jwt);
    const userId = getUserId(jwt);

    const userInfo = await getUserInfo(userId.toString(), jwt);
    if (!userInfo) {
      throw new Error('User info not found');
    }

    await farmGem(userId.toString(), jwt, userInfo);

    return { success: true, message: 'Gem farmed successfully' };
  } catch (error) {
    throw new Error(`Failed to farm gem: ${error.message}`);
  }
}

async function farmXpSessionWrapper(jwt, amount) {
  try {
    const validAmounts = [10, 20, 40, 50, 110];
    if (!validAmounts.includes(amount)) {
      throw new Error(`Invalid amount. Valid amounts are: ${validAmounts.join(', ')}`);
    }

    validateJwt(jwt);
    const userId = getUserId(jwt);

    const userInfo = await getUserInfo(userId.toString(), jwt);
    if (!userInfo) {
      throw new Error('User info not found');
    }

    let skillId = null;
    if (amount === 110) {
      skillId = extractSkillId(userInfo.currentCourse);
      if (!skillId) {
        throw new Error('SkillId not found. Cannot farm 110 XP without skillId.');
      }
    }

    const config = getSessionConfig(amount, skillId || undefined);
    if (!config) {
      throw new Error(`Config not found for amount: ${amount}`);
    }

    const result = await farmSession(
      userId.toString(),
      jwt,
      userInfo,
      config,
    );

    const xpGained = result?.xpGain || result?.awardedXp || 0;

    return {
      success: true,
      xpGained,
      message: `Session farmed successfully. XP gained: ${xpGained}`,
    };
  } catch (error) {
    throw new Error(`Failed to farm XP session: ${error.message}`);
  }
}

// Streak Logic
async function farmStreakWrapper(jwt) {
  try {
    validateJwt(jwt);
    const userId = getUserId(jwt);

    const userInfo = await getUserInfo(userId.toString(), jwt);
    if (!userInfo) {
      throw new Error('User info not found');
    }

    const SECONDS_PER_DAY = 86400;
    const now = Math.floor(Date.now() / 1000);

    const streakStartDate = userInfo?.streakData?.currentStreak?.startDate;
    const streakNumber = typeof userInfo?.streak === 'number' ? userInfo.streak : 0;

    let startTime = now - SECONDS_PER_DAY;

    if (streakStartDate) {
      startTime = Math.floor(new Date(streakStartDate).getTime() / 1000) - SECONDS_PER_DAY;
    } else if (streakNumber > 0) {
      startTime = now - streakNumber * SECONDS_PER_DAY;
    }

    const endTime = startTime + 60;

    await farmSession(
      userId.toString(),
      jwt,
      userInfo,
      {
        sessionPayload: {},
        updateSessionPayload: {},
        startTime,
        endTime,
      },
    );

    return { success: true, message: 'Streak farmed successfully' };
  } catch (error) {
    throw new Error(`Failed to farm streak: ${error.message}`);
  }
}

// Terminal UI
let rl;
let isRunning = false;
let shouldStop = false;
let keypressHandler = null;

function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function printColor(text, color) {
  return `${color}${text}${colors.reset}`;
}

function clearLine() {
  process.stdout.write('\r\x1b[K');
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

// Stats Tracking
class StatsTracker {
  constructor() {
    this.reset();
  }

  reset() {
    this.startTime = null;
    this.successCount = 0;
    this.failedCount = 0;
    this.totalXp = 0;
    this.totalGems = 0;
    this.gemRounds = 0;
    this.xpRounds = 0;
    this.streakRounds = 0;
  }

  start() {
    this.reset();
    this.startTime = Date.now();
  }

  recordGemSuccess() {
    this.successCount++;
    this.totalGems += 30;
    this.gemRounds++;
  }

  recordXpSuccess() {
    this.successCount++;
    this.totalXp += 110;
    this.xpRounds++;
  }

  recordStreakSuccess() {
    this.successCount++;
    this.streakRounds++;
  }

  recordFailure() {
    this.failedCount++;
  }

  getElapsedTime() {
    if (!this.startTime) return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  getRate() {
    const elapsed = this.getElapsedTime();
    if (elapsed === 0) return 0;
    return (this.successCount / elapsed) * 60;
  }

  display() {
    const elapsed = this.getElapsedTime();
    const rate = this.getRate();
    const estimatedGems = this.gemRounds * 30;
    const estimatedXp = this.xpRounds * 110;
    const estimatedStreak = this.streakRounds;
    
    clearLine();
    process.stdout.write(
      `\r${printColor('Stats:', colors.cyan)} ` +
      `${printColor(`Gems: ${this.gemRounds} (+${estimatedGems})`, colors.magenta)} ` +
      `${printColor(`XP: ${this.xpRounds} (+${estimatedXp})`, colors.yellow)} ` +
      `${printColor(`Streak: ${this.streakRounds} (+${estimatedStreak})`, colors.green)} ` +
      `${printColor(`✓ ${this.successCount}`, colors.green)} ` +
      `${printColor(`✗ ${this.failedCount}`, colors.red)} ` +
      `${printColor(`Time: ${formatTime(elapsed)}`, colors.blue)} ` +
      `${printColor(`Rate: ${rate.toFixed(1)}/min`, colors.cyan)}`
    );
  }
}

const stats = new StatsTracker();

function displayUserInfo(userInfo) {
  console.log(printColor('\n=== User Information ===', colors.bright + colors.cyan));
  console.log(`${printColor('Username:', colors.bright)} ${userInfo.username || 'N/A'}`);
  console.log(`${printColor('User ID:', colors.bright)} ${userInfo.id || 'N/A'}`);
  console.log(`${printColor('Total XP:', colors.bright)} ${userInfo.totalXp || 0}`);
  console.log(`${printColor('Level:', colors.bright)} ${userInfo.level || 0}`);
  console.log(`${printColor('Streak:', colors.bright)} ${userInfo.streak || 0} days`);
  console.log(`${printColor('Gems:', colors.bright)} ${userInfo.gems || 0}`);
  console.log(`${printColor('Learning:', colors.bright)} ${userInfo.learningLanguage || 'N/A'}`);
  console.log(`${printColor('From:', colors.bright)} ${userInfo.fromLanguage || 'N/A'}`);
  console.log(printColor('========================\n', colors.bright + colors.cyan));
}

function displayMenu() {
  console.log(printColor('\n=== Menu ===', colors.bright + colors.cyan));
  console.log('1. Farm Gems (vô hạn)');
  console.log('2. Farm XP Session 110 (vô hạn)');
  console.log('3. Farm Streak (vô hạn)');
  console.log('4. Kết hợp (nhập số vòng)');
  console.log('0. Thoát');
  console.log(printColor('================\n', colors.bright + colors.cyan));
}

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function farmGemsInfinite(jwt) {
  console.log(printColor('\nBắt đầu Farm Gems (vô hạn)...', colors.yellow));
  console.log(printColor('Nhấn "q" để dừng\n', colors.dim));
  
  stats.start();
  shouldStop = false;
  isRunning = true;
  enableKeypressMode();

  while (!shouldStop) {
    try {
      await farmGemWrapper(jwt);
      stats.recordGemSuccess();
      stats.display();
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      stats.recordFailure();
      stats.display();
      clearLine();
      process.stdout.write(`\r${printColor(`Error: ${error.message}`, colors.red)}\n`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  isRunning = false;
  disableKeypressMode();
  console.log(printColor('\n\nĐã dừng Farm Gems', colors.yellow));
  stats.display();
  console.log('');
}

async function farmXpSessionInfinite(jwt) {
  console.log(printColor('\nBắt đầu Farm XP Session 110 (vô hạn)...', colors.yellow));
  console.log(printColor('Nhấn "q" để dừng\n', colors.dim));
  
  stats.start();
  shouldStop = false;
  isRunning = true;
  enableKeypressMode();

  while (!shouldStop) {
    try {
      await farmXpSessionWrapper(jwt, 110);
      stats.recordXpSuccess();
      stats.display();
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      stats.recordFailure();
      stats.display();
      clearLine();
      process.stdout.write(`\r${printColor(`Error: ${error.message}`, colors.red)}\n`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  isRunning = false;
  disableKeypressMode();
  console.log(printColor('\n\nĐã dừng Farm XP Session 110', colors.yellow));
  stats.display();
  console.log('');
}

async function farmStreakInfinite(jwt) {
  console.log(printColor('\nBắt đầu Farm Streak (vô hạn)...', colors.yellow));
  console.log(printColor('Nhấn "q" để dừng\n', colors.dim));
  
  stats.start();
  shouldStop = false;
  isRunning = true;
  enableKeypressMode();

  while (!shouldStop) {
    try {
      await farmStreakWrapper(jwt);
      stats.recordStreakSuccess();
      stats.display();
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      stats.recordFailure();
      stats.display();
      clearLine();
      process.stdout.write(`\r${printColor(`Error: ${error.message}`, colors.red)}\n`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  isRunning = false;
  disableKeypressMode();
  console.log(printColor('\n\nĐã dừng Farm Streak', colors.yellow));
  stats.display();
  console.log('');
}

async function farmCombo(jwt, gemRounds, xpRounds, streakRounds) {
  const totalRounds = gemRounds + xpRounds + streakRounds;
  console.log(printColor(`\nBắt đầu Kết hợp:`, colors.yellow));
  console.log(printColor(`  - Gems: ${gemRounds} lần`, colors.dim));
  console.log(printColor(`  - XP Session 110: ${xpRounds} lần`, colors.dim));
  console.log(printColor(`  - Streak: ${streakRounds} lần`, colors.dim));
  console.log(printColor('Nhấn "q" để dừng\n', colors.dim));
  
  stats.start();
  shouldStop = false;
  isRunning = true;
  enableKeypressMode();
  const userId = getUserId(jwt);

  let currentRound = 0;

  // Farm Gems
  for (let i = 0; i < gemRounds && !shouldStop; i++) {
    currentRound++;
    try {
      await farmGemWrapper(jwt);
      stats.recordGemSuccess();
      stats.display();
    } catch (error) {
      stats.recordFailure();
      stats.display();
      clearLine();
      process.stdout.write(`\r${printColor(`Error Gem: ${error.message}`, colors.red)}\n`);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Farm XP Session 110
  for (let i = 0; i < xpRounds && !shouldStop; i++) {
    currentRound++;
    try {
      await farmXpSessionWrapper(jwt, 110);
      stats.recordXpSuccess();
      stats.display();
    } catch (error) {
      stats.recordFailure();
      stats.display();
      clearLine();
      process.stdout.write(`\r${printColor(`Error XP: ${error.message}`, colors.red)}\n`);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Farm Streak
  for (let i = 0; i < streakRounds && !shouldStop; i++) {
    currentRound++;
    try {
      await farmStreakWrapper(jwt);
      stats.recordStreakSuccess();
      stats.display();
    } catch (error) {
      stats.recordFailure();
      stats.display();
      clearLine();
      process.stdout.write(`\r${printColor(`Error Streak: ${error.message}`, colors.red)}\n`);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  isRunning = false;
  disableKeypressMode();
  console.log(printColor('\n\nĐã hoàn thành Kết hợp', colors.yellow));
  stats.display();
  console.log('');
}

function setupKeypressHandler() {
  if (process.stdin.isTTY) {
    readline.emitKeypressEvents(process.stdin);
  }
  
  keypressHandler = (str, key) => {
    if (key && key.name === 'q' && isRunning) {
      shouldStop = true;
      console.log(printColor('\n\nĐang dừng...', colors.yellow));
      return;
    }
    if (key && key.ctrl && key.name === 'c' && !isRunning) {
      console.log(printColor('\n\nTạm biệt!', colors.cyan));
      process.exit(0);
    }
    // Ignore 'q' when not running to prevent it from being processed by readline
    if (key && key.name === 'q' && !isRunning) {
      return;
    }
  };
  
  process.stdin.on('keypress', keypressHandler);
}

function enableKeypressMode() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
}

function disableKeypressMode() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
    // Clear any remaining input
    process.stdin.pause();
    process.stdin.resume();
  }
}

async function main() {
  rl = createReadline();
  setupKeypressHandler();

  console.log(printColor('=== Duofarmer CLI ===', colors.bright + colors.cyan));
  console.log(printColor('Nhập JWT token để bắt đầu\n', colors.dim));

  // Get JWT token
  let jwt = '';
  while (!jwt) {
    jwt = await askQuestion(printColor('JWT Token: ', colors.bright));
    jwt = jwt.trim();
    if (!jwt) {
      console.log(printColor('JWT token không được để trống!', colors.red));
    }
  }

  // Validate JWT and get user info
  try {
    console.log(printColor('\nĐang xác thực JWT...', colors.yellow));
    validateJwt(jwt);
    const userId = getUserId(jwt);
    console.log(printColor('JWT hợp lệ!', colors.green));
    
    console.log(printColor('Đang lấy thông tin user...', colors.yellow));
    const userInfo = await getUserInfo(userId.toString(), jwt);
    displayUserInfo(userInfo);
  } catch (error) {
    console.log(printColor(`\nLỗi: ${error.message}`, colors.red));
    rl.close();
    process.exit(1);
  }

  // Main menu loop
  while (true) {
    displayMenu();
    const choice = await askQuestion(printColor('Chọn option (0-4): ', colors.bright));
    
    switch (choice.trim()) {
      case '1':
        await farmGemsInfinite(jwt);
        break;
      case '2':
        await farmXpSessionInfinite(jwt);
        break;
      case '3':
        await farmStreakInfinite(jwt);
        break;
      case '4':
        const gemRoundsInput = await askQuestion(printColor('Nhập số lần Farm Gems: ', colors.bright));
        const gemRounds = parseInt(gemRoundsInput.trim(), 10);
        if (isNaN(gemRounds) || gemRounds < 0) {
          console.log(printColor('Số lần Farm Gems không hợp lệ!', colors.red));
          break;
        }
        
        const xpRoundsInput = await askQuestion(printColor('Nhập số lần Farm XP Session 110: ', colors.bright));
        const xpRounds = parseInt(xpRoundsInput.trim(), 10);
        if (isNaN(xpRounds) || xpRounds < 0) {
          console.log(printColor('Số lần Farm XP Session 110 không hợp lệ!', colors.red));
          break;
        }
        
        const streakRoundsInput = await askQuestion(printColor('Nhập số lần Farm Streak: ', colors.bright));
        const streakRounds = parseInt(streakRoundsInput.trim(), 10);
        if (isNaN(streakRounds) || streakRounds < 0) {
          console.log(printColor('Số lần Farm Streak không hợp lệ!', colors.red));
          break;
        }
        
        if (gemRounds === 0 && xpRounds === 0 && streakRounds === 0) {
          console.log(printColor('Phải nhập ít nhất 1 loại với số lần > 0!', colors.red));
          break;
        }
        
        await farmCombo(jwt, gemRounds, xpRounds, streakRounds);
        break;
      case '0':
        console.log(printColor('\nTạm biệt!', colors.cyan));
        rl.close();
        process.exit(0);
        break;
      default:
        console.log(printColor('Option không hợp lệ!', colors.red));
        break;
    }
  }
}

// Run main
main().catch((error) => {
  console.error(printColor(`\nFatal error: ${error.message}`, colors.red));
  if (rl) rl.close();
  process.exit(1);
});

