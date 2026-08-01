const PACKAGE_BASE_NAME = 'layoff-survival-simulator';
const FIXED_DOS_TIME = 0;
const FIXED_DOS_DATE = 33;

let crcTable;

export function createReleaseManifest(config, options = {}) {
  const version = options.version || config.version;
  const packageName = options.packageName || `${PACKAGE_BASE_NAME}-v${version}`;
  const archiveName = options.archiveName || `${packageName}.zip`;
  const files = (options.files || [])
    .map((file) => ({
      path: normalizeArchivePath(file.path),
      bytes: file.bytes
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

  return {
    schemaVersion: 1,
    packageName,
    archiveName,
    version,
    generatedAt: options.generatedAt || new Date().toISOString(),
    title: config.title,
    eventCount: config.eventStats.total,
    eventMix: {
      daily: config.eventStats.daily,
      crisis: config.eventStats.crisis,
      opportunity: config.eventStats.opportunity
    },
    endingCount: config.endings.length,
    adPlacementCount: config.adPlacements.length,
    totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
    files
  };
}

export function createReleaseReadme(manifest) {
  return [
    '# 大厂裁员生存模拟器 Release',
    '',
    `版本：${manifest.version}`,
    `归档包：${manifest.archiveName}`,
    `生成时间：${manifest.generatedAt}`,
    '',
    '## 内容摘要',
    '',
    `- 事件数：${manifest.eventCount}`,
    `- 日常/危机/机遇：${manifest.eventMix.daily}/${manifest.eventMix.crisis}/${manifest.eventMix.opportunity}`,
    `- 结局数：${manifest.endingCount}`,
    `- 广告点位：${manifest.adPlacementCount}`,
    `- 文件数：${manifest.files.length}`,
    `- 文件总大小：${manifest.totalBytes} bytes`,
    '',
    '## 运行方式',
    '',
    '1. 解压归档包。',
    '2. 在解压目录运行 `node scripts/server.mjs`。',
    '3. 打开 `http://127.0.0.1:4173/`。',
    '',
    '## 文件清单',
    '',
    '| 文件 | 大小 |',
    '| --- | ---: |',
    ...manifest.files.map((file) => `| ${file.path} | ${file.bytes} |`),
    ''
  ].join('\n');
}

export function createStoredZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const path = normalizeArchivePath(entry.path);
    const name = Buffer.from(path, 'utf8');
    const content = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content);
    const crc = crc32(content);
    const localHeader = createLocalHeader(name, content, crc);
    const centralHeader = createCentralHeader(name, content, crc, offset);

    localParts.push(localHeader, content);
    centralParts.push(centralHeader);
    offset += localHeader.length + content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const eocd = createEndOfCentralDirectory(entries.length, centralDirectory.length, offset);
  return Buffer.concat([...localParts, centralDirectory, eocd]);
}

function createLocalHeader(name, content, crc) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(FIXED_DOS_TIME, 10);
  header.writeUInt16LE(FIXED_DOS_DATE, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(content.length, 18);
  header.writeUInt32LE(content.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, name]);
}

function createCentralHeader(name, content, crc, offset) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(FIXED_DOS_TIME, 12);
  header.writeUInt16LE(FIXED_DOS_DATE, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(content.length, 20);
  header.writeUInt32LE(content.length, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);
  return Buffer.concat([header, name]);
}

function createEndOfCentralDirectory(entryCount, centralSize, centralOffset) {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(entryCount, 8);
  header.writeUInt16LE(entryCount, 10);
  header.writeUInt32LE(centralSize, 12);
  header.writeUInt32LE(centralOffset, 16);
  header.writeUInt16LE(0, 20);
  return header;
}

function crc32(buffer) {
  const table = getCrcTable();
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getCrcTable() {
  if (crcTable) {
    return crcTable;
  }

  crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    crcTable[i] = value >>> 0;
  }
  return crcTable;
}

function normalizeArchivePath(path) {
  const normalized = path.replaceAll('\\', '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('../')) {
    throw new Error(`Invalid archive path: ${path}`);
  }
  return normalized;
}
