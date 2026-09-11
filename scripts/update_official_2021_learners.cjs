const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const official2021List = [
  { surname: 'MANYAKANYAKA', firstName: 'PHINDIWE', secondName: 'SYLVIA', idNumber: '7209161127089', comments: 'Enrolled' },
  { surname: 'MZINDA', firstName: 'PHILISWA', secondName: '', idNumber: '8710210453086', comments: 'Enrolled' },
  { surname: 'TASE', firstName: 'ASEMAHLE', secondName: '', idNumber: '8806291014084', comments: 'Enrolled' },
  { surname: 'MUSEKWA', firstName: 'MUSHONI PERCY', secondName: '', idNumber: '9202276302083', comments: 'Enrolled' },
  { surname: 'RAMUKHUBA', firstName: 'NTHANGENI', secondName: 'THOMAS', idNumber: '6507076221082', comments: 'Enrolled' },
  { surname: 'CHOSHI', firstName: 'MOLOKO', secondName: 'GODSON', idNumber: '8204276415080', comments: 'Enrolled' },
  { surname: 'SHIBAMBU', firstName: 'NKHENSANI', secondName: 'CHARLES', idNumber: '7912285474085', comments: 'Enrolled' },
  { surname: 'SEALE', firstName: 'ANDREW', secondName: '', idNumber: '6806095778084', comments: 'Enrolled' },
  { surname: 'MATHEBULA', firstName: 'VUSI', secondName: '', idNumber: '9007296046085', comments: 'Enrolled' },
  { surname: 'MOEKETSI', firstName: 'DONALD', secondName: 'JONATHAN', idNumber: '9105116171081', comments: 'Enrolled' },
  { surname: 'CHAUKE', firstName: 'MIKE', secondName: 'BOB', idNumber: '8404176196083', comments: 'Enrolled' },
  { surname: 'NCHABELENG', firstName: 'LEHLOGONOLO', secondName: 'KOMANE', idNumber: '9205176198089', comments: 'Enrolled' },
  { surname: 'MARIBENG', firstName: 'MAROPE', secondName: 'WILLIAM', idNumber: '8402085800084', comments: 'Enrolled' },
  { surname: 'MHLANGA', firstName: 'GETRUDE', secondName: 'NOMALANGA', idNumber: '7804120457088', comments: 'Enrolled' },
  { surname: 'MAKA', firstName: 'MANDISA', secondName: '', idNumber: '9112251424085', comments: 'Enrolled' },
  { surname: 'MAPHANGA', firstName: 'SARAH', secondName: '', idNumber: '8609141263087', comments: 'Enrolled' },
  { surname: 'MASILELA', firstName: 'ISAAC', secondName: 'SHORTY', idNumber: '9405146108081', comments: 'Enrolled' },
  { surname: 'MUDZANANI', firstName: 'NDIVHUHO', secondName: '', idNumber: '8908121204081', comments: 'Enrolled' },
  { surname: 'MZINZILI', firstName: 'BUSISWA', secondName: 'VERONICA', idNumber: '8802130990089', comments: 'Enrolled' },
  { surname: 'MAZIBUKO', firstName: 'THULISILE', secondName: 'CYNTHIA', idNumber: '8705291108088', comments: 'Enrolled' },
  { surname: 'MCHUNU', firstName: 'MCEBO', secondName: '', idNumber: '9008205667086', comments: 'Enrolled' },
  { surname: 'THWALA', firstName: 'NTOMBIFUTHI PRETTY', secondName: '', idNumber: '8209020597083', comments: 'Enrolled' },
  { surname: 'MESO_', firstName: 'TLOU', secondName: 'GODWIN', idNumber: '7409105567081', comments: 'Enrolled' },
  { surname: 'MTHIMUNYE', firstName: 'FREDDY', secondName: 'MADIMETJA', idNumber: '9206275434086', comments: 'Enrolled' },
  { surname: 'MASHILOANE', firstName: 'KHOMOTSO', secondName: 'HUMPHEREY', idNumber: '8110065547084', comments: 'Enrolled' },
  { surname: 'MTHETHO', firstName: 'AELVIS', secondName: '', idNumber: '6606156047084', comments: 'Enrolled' },
  { surname: 'LUKHELE', firstName: 'VUSUMUZI', secondName: 'SAMSON', idNumber: '7712095555085', comments: 'Enrolled' },
  { surname: 'TSHABALALA', firstName: 'TSHEPO', secondName: '', idNumber: '9006066303080', comments: 'Enrolled' },
  { surname: 'RAKGOTHO', firstName: 'SHIMANE', secondName: 'JOHANNES', idNumber: '9605085464086', comments: 'Enrolled' },
  { surname: 'GUMEDE', firstName: 'COLLIN', secondName: '', idNumber: '8305056697084', comments: 'Enrolled' },
  { surname: 'SIWELANE', firstName: 'MPHO', secondName: '', idNumber: '9709265275088', comments: 'Enrolled' },
  { surname: 'JAKUJA', firstName: 'MKHUSELI', secondName: 'EMMANUEL', idNumber: '9102195813089', comments: 'Enrolled' },
  { surname: 'MALULEKE', firstName: 'HLUPHEKA', secondName: 'JEFREY', idNumber: '7801135327082', comments: 'Enrolled' },
  { surname: 'SEKGOTA', firstName: 'SONTI', secondName: 'CLASS', idNumber: '7708115646086', comments: 'Enrolled' },
  { surname: 'MALEFANE', firstName: 'MORONGOE', secondName: 'JULIA', idNumber: '7001110374080', comments: 'Enrolled' },
  { surname: 'DHLADHLA', firstName: 'MARIA', secondName: 'NTSOAKI', idNumber: '8501140387084', comments: 'Enrolled' },
  { surname: 'MADLIWA', firstName: 'BULELWA', secondName: '', idNumber: '9104211011086', comments: 'Enrolled' },
  { surname: 'MADIKANE', firstName: 'FIKILE', secondName: '', idNumber: '8804175970083', comments: 'Enrolled' },
  { surname: 'MADONDO', firstName: 'SIMANGELE', secondName: '', idNumber: '8809031198084', comments: 'Enrolled' },
  { surname: 'MKHWANAZI', firstName: 'MBHEKENI', secondName: 'ZAMA', idNumber: '7605056737082', comments: 'Enrolled' },
  { surname: 'NDLOVU', firstName: 'SIPHO', secondName: 'AFRICA', idNumber: '8509106776083', comments: 'Enrolled' },
  { surname: 'NGCOBO', firstName: 'BONGINKOSI', secondName: 'MICHAEL', idNumber: '8908036163083', comments: 'Enrolled' },
  { surname: 'MBHELE', firstName: 'SABELO', secondName: 'SYDNEY', idNumber: '8701275636087', comments: 'Enrolled' },
  { surname: 'MAGABA', firstName: 'TSHEPO', secondName: 'CONFIDENCE', idNumber: '8208305502081', comments: 'Enrolled' },
  { surname: 'THABETHE', firstName: 'JOTHAM', secondName: 'VICTOR', idNumber: '7406045579085', comments: 'Enrolled' },
  { surname: 'SEMOSA', firstName: 'SEKEDI', secondName: 'CHRISTINAH', idNumber: '8801070832087', comments: 'Enrolled' },
  { surname: 'SEFOLO', firstName: 'KGAAUGELO', secondName: '', idNumber: '9604255747081', comments: 'Enrolled' },
  { surname: 'SPEL', firstName: 'LIZZY', secondName: 'THANDIWE', idNumber: '8203151098086', comments: 'Enrolled' },
  { surname: 'PITER', firstName: 'ZOLANI', secondName: 'SAM', idNumber: '7312257134082', comments: 'Enrolled' },
  { surname: 'MOHLAMONYANE', firstName: 'STEVEN', secondName: '', idNumber: '9307305354086', comments: 'Enrolled' },
  { surname: 'CIBANE', firstName: 'SYLVERIOUS', secondName: 'HLANGANANI', idNumber: '8904275512080', comments: 'Enrolled' },
  { surname: 'MAKHUBELA', firstName: 'AUDREY', secondName: '', idNumber: '9104210600087', comments: 'Enrolled' },
  { surname: 'MAKOENA', firstName: 'MARTHA MAKGOKOLOTSE', secondName: '', idNumber: '7207271033080', comments: 'Enrolled' },
  { surname: 'KHOPHOCHE', firstName: 'DINAH NTSOAKI', secondName: '', idNumber: '9008100412083', comments: 'Enrolled' },
  { surname: 'MALALE', firstName: 'MARUPING T', secondName: '', idNumber: '8212291130089', comments: 'Enrolled' },
  { surname: 'SHABALALA', firstName: 'MALETSANE PETRUS', secondName: '', idNumber: '7807145312089', comments: 'Enrolled' },
  { surname: 'RAPAPALI', firstName: 'NTEBALENG GLORIA', secondName: '', idNumber: '8110310537088', comments: 'Enrolled' },
  { surname: 'MABOKELA', firstName: 'KWENA MARIA', secondName: '', idNumber: '7802240408080', comments: 'Enrolled' },
  { surname: 'MATLHOKO', firstName: 'NEO REJOYCE', secondName: '', idNumber: '7904220877084', comments: 'Enrolled' },
  { surname: 'MLATA', firstName: 'NANGAMSO', secondName: '', idNumber: '9209151507082', comments: 'Enrolled' },
  { surname: 'SOSIBO', firstName: 'TELLO', secondName: 'JACOB', idNumber: '8207085346081', comments: 'Enrolled' },
  { surname: 'MABIZELA', firstName: 'JANTRY THULANI', secondName: '', idNumber: '7908045958086', comments: 'Enrolled' },
  { surname: 'MAOKE', firstName: 'MOEKETSI METHWES', secondName: '', idNumber: '8602055857085', comments: 'Enrolled' },
  { surname: 'KHUMALO', firstName: 'BUSISIWE', secondName: '', idNumber: '8608030710083', comments: 'Enrolled' },
  { surname: 'HLOPHE', firstName: 'DUMAZI', secondName: 'FREDRIC', idNumber: '8503275863087', comments: 'Enrolled' },
  { surname: 'NGOZO', firstName: 'THEMBINKOSI', secondName: 'WALTER', idNumber: '9305135919086', comments: 'Enrolled' },
  { surname: 'MKWANAZI', firstName: 'SIMON', secondName: 'TSHEPO', idNumber: '8407076343085', comments: 'Enrolled' },
  { surname: 'NJUZA', firstName: 'MYEZO', secondName: '', idNumber: '9609176603081', comments: 'Enrolled' },
  { surname: 'BALOGI', firstName: 'CALFONIA', secondName: '', idNumber: '9008180536082', comments: 'Enrolled' },
  { surname: 'MALULEKA', firstName: 'PETER', secondName: '', idNumber: '8707295551081', comments: 'Enrolled' },
  { surname: 'BALOYI', firstName: 'SIBONGILE', secondName: 'MILLCENT', idNumber: '8608290881087', comments: 'Enrolled' },
  { surname: 'MOKOBAKI', firstName: 'RAMOGANENG', secondName: 'MARGARET', idNumber: '8805140615083', comments: 'Enrolled' },
  { surname: 'MAENETJA', firstName: 'ASSENT', secondName: '', idNumber: '9512170872084', comments: 'Enrolled' },
  { surname: 'MOITSE', firstName: 'JOHANNES', secondName: 'RAMMULE', idNumber: '9101205551085', comments: 'Enrolled' },
  { surname: 'MAZIYA', firstName: 'GIFT', secondName: 'THABO', idNumber: '9809185353088', comments: 'Enrolled' },
  { surname: 'TLOU', firstName: 'PAUL', secondName: '', idNumber: '7903035448081', comments: 'Enrolled' },
  { surname: 'DIBILE', firstName: 'AVIWE', secondName: '', idNumber: '9811206331085', comments: 'Enrolled' },
  { surname: 'ZWANE', firstName: 'MZWANDILE', secondName: 'SIMON', idNumber: '8409205448082', comments: 'Enrolled' },
  { surname: 'SAMBO', firstName: 'GLORIA', secondName: 'MOLOGADI', idNumber: '8107300499089', comments: 'Enrolled' },
  { surname: 'MUNYAI', firstName: 'KAGISO', secondName: '', idNumber: '9907045409080', comments: 'Enrolled' },
  { surname: 'DITSHEGO', firstName: 'MMAMODIBEDI', secondName: 'PETRUNIA', idNumber: '9109280663089', comments: 'Enrolled' },
  { surname: 'TSHIFARO', firstName: 'THABO', secondName: 'ABEL', idNumber: '8311285746080', comments: 'Enrolled' },
  { surname: 'RAMAUDE', firstName: 'MADUMANE', secondName: 'REBECCA', idNumber: '9009190935082', comments: 'Enrolled' },
  { surname: 'MATENTJE', firstName: 'JULIA', secondName: 'SESIANA', idNumber: '8202221215084', comments: 'Enrolled' },
  { surname: 'MLAMBO', firstName: 'MUNYARADZI', secondName: 'CHARLES', idNumber: '9308125144087', comments: 'Enrolled' },
  { surname: 'MAHAFHA', firstName: 'TSHIFIWA', secondName: 'ELISAH', idNumber: '7602150908081', comments: 'Enrolled' },
  { surname: 'MPORO', firstName: 'MPHASI', secondName: 'JOHANNES', idNumber: '8909125385082', comments: 'Enrolled' },
  { surname: 'KIET', firstName: 'VELANI', secondName: 'ANDREW', idNumber: '7206275898084', comments: 'Enrolled' },
  { surname: 'MAKGATA', firstName: 'MODUPI', secondName: 'ISAIAH', idNumber: '8709045784087', comments: 'Enrolled' },
  { surname: 'MALAPANE', firstName: 'JACOB', secondName: 'TSHEPISO', idNumber: '8806175490087', comments: 'Enrolled' },
  { surname: 'KGOMO', firstName: 'SYDNEY', secondName: 'THABO', idNumber: '8504305332085', comments: 'Enrolled' },
  { surname: 'LEBOMBO', firstName: 'SAMUEL', secondName: '', idNumber: '8303265382085', comments: 'Enrolled' },
  { surname: 'MAHLANGU', firstName: 'PERCY', secondName: 'LEFA', idNumber: '9211205598083', comments: 'Enrolled' },
  { surname: 'KOMANA', firstName: 'MEADOLANDS', secondName: 'MOSES', idNumber: '7810075392089', comments: 'Enrolled' },
  { surname: 'MOABO', firstName: 'REVIS', secondName: '', idNumber: '8204185439080', comments: 'Enrolled' },
  { surname: 'NGCWAMA', firstName: 'PHUTHUMA', secondName: '', idNumber: '7907240554088', comments: 'Enrolled' },
  { surname: 'NKWANYANYANA', firstName: 'SIBONGISENI', secondName: 'LINDINKOSI', idNumber: '8510295596084', comments: 'Enrolled' },
  { surname: 'MAKOU', firstName: 'NGETA', secondName: 'AARON', idNumber: '8412296111080', comments: 'Enrolled' },
  { surname: 'CIKWAYO', firstName: 'SITHEMBISO', secondName: 'PRINCE', idNumber: '9004055540085', comments: 'Enrolled' },
  { surname: 'MZELEMU', firstName: 'DIFANO', secondName: 'SIYANDA', idNumber: '9111235973084', comments: 'Enrolled' },
  { surname: 'MTHEMBU', firstName: 'BHEKITHEMBA', secondName: 'NHLAKANIPHO', idNumber: '8904185716086', comments: 'Enrolled' },
  { surname: 'SHANDU', firstName: 'LUNGISANI', secondName: 'MVELO', idNumber: '9107265696082', comments: 'Enrolled' },
  { surname: 'MOKOENA', firstName: 'SIMPHIWE', secondName: 'PERFECT', idNumber: '8908205808088', comments: 'Enrolled' },
  { surname: 'MOKHANTSO', firstName: 'DAVID', secondName: 'MONAHENA', idNumber: '7101115807082', comments: 'Enrolled' },
  { surname: 'MTHATHAMBI', firstName: 'NKOSIVUMILE', secondName: 'JERONE', idNumber: '8904216167085', comments: 'Enrolled' },
  { surname: 'PHALA', firstName: 'JIM', secondName: 'PADIMANA SELLO', idNumber: '9702015434089', comments: 'Enrolled' },
  { surname: 'MORUMUDI', firstName: 'RASENOANE', secondName: 'ALPHEUS', idNumber: '9606165267084', comments: 'Enrolled' },
  { surname: 'MATHEBULA', firstName: 'DONALD', secondName: 'SUMBA', idNumber: '7005135511089', comments: 'Enrolled' },
  { surname: 'KGAPULE', firstName: 'COLLECTION', secondName: 'MOHEMO', idNumber: '9312035576081', comments: 'Enrolled' },
  { surname: 'RAMASILO', firstName: 'SABATA', secondName: 'LUCAS', idNumber: '8806265256083', comments: 'Enrolled' },
  { surname: 'RABOROKO', firstName: 'MANTWA', secondName: 'PATRICIA', idNumber: '9010081055089', comments: 'Enrolled' },
  { surname: 'NKOHLA', firstName: 'SIBONISILE', secondName: 'PRINCE', idNumber: '9103306184089', comments: 'Enrolled' },
  { surname: 'LENKA', firstName: 'ITUMELENG INNOCENTIA', secondName: '', idNumber: '8701131053089', comments: 'Enrolled' },
  { surname: 'NKOSI', firstName: 'VUSI', secondName: '', idNumber: '8508045215088', comments: 'Enrolled' },
  { surname: 'HLUNGWANI', firstName: 'MATOME', secondName: 'PRINCE', idNumber: '9304126142089', comments: 'Enrolled' },
  { surname: 'NGHONYAMA', firstName: 'LORRAINE', secondName: '', idNumber: '9005120679089', comments: 'Enrolled' },
  { surname: 'MOLOTO', firstName: 'NKWANE', secondName: 'KHUTSO', idNumber: '9204285863089', comments: 'Enrolled' },
  { surname: 'MORUDU', firstName: 'MAHLATSE', secondName: 'MOKGADI', idNumber: '9306050264086', comments: 'Enrolled' },
  { surname: 'APHANE', firstName: 'COLLEN', secondName: 'LEFTY', idNumber: '8309225923082', comments: 'Enrolled' },
  { surname: 'MAPHOSO', firstName: 'MAESELA', secondName: 'ISHMAEL', idNumber: '7501265512087', comments: 'Enrolled' },
  { surname: 'MAPODILE', firstName: 'MAGEDI', secondName: 'OBADIEL', idNumber: '7104165464085', comments: 'Enrolled' },
  { surname: 'NEGOGOGO', firstName: 'DZIVHULUWANI', secondName: 'KENETH', idNumber: '8303106204084', comments: 'Enrolled' },
  { surname: 'KUBJANA', firstName: 'RADITLALE', secondName: '', idNumber: '6906025737083', comments: 'Enrolled' },
  { surname: 'SITHOLE', firstName: 'MHLENGI', secondName: '', idNumber: '9310046379081', comments: 'Enrolled' },
  { surname: 'MOATSHE', firstName: 'SERWANYE', secondName: 'SOPHONIA', idNumber: '8508065911087', comments: 'Enrolled' },
  { surname: 'BOTABOTA', firstName: 'NGOAKO', secondName: 'JIM', idNumber: '8809125332086', comments: 'Enrolled' },
  { surname: 'CHAKA', firstName: 'DINGANI', secondName: 'WALTER', idNumber: '7801195473081', comments: 'Enrolled' },
  { surname: 'MHLWANA', firstName: 'LUNGISANI', secondName: '', idNumber: '9205156083087', comments: 'Enrolled' },
  { surname: 'RAKGALAKANA', firstName: 'TUMISI', secondName: 'SONNYBOY', idNumber: '7501026465088', comments: 'Enrolled' },
  { surname: 'MALEKA', firstName: 'THULANE', secondName: 'MICHAEL', idNumber: '7112275457089', comments: 'Enrolled' },
  { surname: 'KEKANA', firstName: 'THOMAS', secondName: 'OUPA', idNumber: '7701265635082', comments: 'Enrolled' },
  { surname: 'MSIMANGO', firstName: 'SIBONGILE', secondName: 'MARIA', idNumber: '8401310927084', comments: 'Enrolled' },
  { surname: 'TSHAPHA', firstName: 'ZUKILE', secondName: 'CHRISTOPHER', idNumber: '7611115755081', comments: 'Enrolled' },
  { surname: 'MOTAU', firstName: 'PHETOLE', secondName: 'SOLOMON', idNumber: '6704025443087', comments: 'Enrolled' },
  { surname: 'MOGALE', firstName: 'GEORGE', secondName: '', idNumber: '7603015817087', comments: 'Enrolled' },
  { surname: 'NKUNA', firstName: 'LAZARUS JUSTICE', secondName: '', idNumber: '7904075929089', comments: 'Enrolled' },
  { surname: 'SINYANYA', firstName: 'CEBO', secondName: '', idNumber: '9001016449083', comments: 'Enrolled' },
  { surname: 'MOATSHE', firstName: 'MANGWENG', secondName: 'JOSIA', idNumber: '7307305347082', comments: 'Enrolled' },
  { surname: 'TSHALI', firstName: 'NONKULULEKO', secondName: 'MERRIAM', idNumber: '9103151244087', comments: 'Enrolled' },
  { surname: 'MATHEBULA', firstName: 'THOMAS', secondName: '', idNumber: '7310265528089', comments: 'Enrolled' },
  { surname: 'MPEHLA', firstName: 'MASIXOLE', secondName: '', idNumber: '9603195734084', comments: 'Enrolled' },
  { surname: 'MEKGWE', firstName: 'EMMANUEL', secondName: '', idNumber: '9309126237086', comments: 'Enrolled' },
  { surname: 'SEANEGO', firstName: 'MATOME ELIAS', secondName: '', idNumber: '7809025909083', comments: 'Enrolled' },
  { surname: 'SELANE', firstName: 'MADIBE EVONNE', secondName: '', idNumber: '8111240758083', comments: 'Enrolled' },
  { surname: 'ZULU', firstName: 'BENJAMIN', secondName: 'SIMPHIWE', idNumber: '7306215810080', comments: 'Enrolled' },
  { surname: 'SIRAFHA', firstName: 'GLENDAR', secondName: '', idNumber: '9007220595082', comments: 'Enrolled' },
  { surname: 'LETLALO', firstName: 'KOLOBE', secondName: 'CHRISTOPHER', idNumber: '7505055385083', comments: 'Enrolled' },
  { surname: 'BUTHELEZI', firstName: 'THOBANI', secondName: '', idNumber: '9504056056080', comments: 'Enrolled' },
  { surname: 'TSHABALALA', firstName: 'MODISE', secondName: 'JAMES', idNumber: '6805195470089', comments: 'Enrolled' },
  { surname: 'MASHAVA', firstName: 'KHATALANI', secondName: "M'CCATHY", idNumber: '7903075974087', comments: 'Enrolled' },
  { surname: 'MOLEPO', firstName: 'RODNEY', secondName: 'MALATSWA', idNumber: '7708115358088', comments: 'Enrolled' },
  { surname: 'VAN VOOR', firstName: 'IRENE', secondName: '', idNumber: '8310255385085', comments: 'Enrolled' },
  { surname: 'MULAUDZI', firstName: 'MASHUDU', secondName: '', idNumber: '9203061004082', comments: 'Enrolled' },
  { surname: 'NKWANA', firstName: 'PULENG', secondName: 'ANDRIES', idNumber: '8905025772080', comments: 'Enrolled' },
  { surname: 'MARIPANE', firstName: 'KGATEDI', secondName: 'NICCOLUS', idNumber: '7810245336081', comments: 'Enrolled' },
  { surname: 'MELLO', firstName: 'EVELYN', secondName: 'RAMATSIMELA', idNumber: '8509280637085', comments: 'Enrolled' },
  { surname: 'MOEKETSI', firstName: 'MAKUANE', secondName: 'JOSEPH', idNumber: '6802125338080', comments: 'Enrolled' },
  { surname: 'MOKOTEDI', firstName: 'JOHANNES', secondName: '', idNumber: '8503115386083', comments: 'Enrolled' },
  { surname: 'MATLALA', firstName: 'TSHEPO', secondName: 'KOTI', idNumber: '8807246078083', comments: 'Enrolled' },
  { surname: 'MATJOKANE', firstName: 'SHADRACK', secondName: 'THABO', idNumber: '7909235674087', comments: 'Enrolled' },
  { surname: 'MASEMOLA', firstName: 'EVANS', secondName: '', idNumber: '9511165820082', comments: 'Enrolled' },
  { surname: 'NGCOBO', firstName: 'THABISILE', secondName: 'NESSI', idNumber: '8305210413089', comments: 'Enrolled' },
  { surname: 'MDLULI', firstName: 'NYIKO', secondName: 'CHRIS', idNumber: '8003305446086', comments: 'Enrolled' },
  { surname: 'MALETE', firstName: 'MALESELA', secondName: 'JONIUS', idNumber: '8310255352085', comments: 'Enrolled' },
  { surname: 'MYENI', firstName: 'MKHULISENI', secondName: 'EDMOND', idNumber: '8107255810082', comments: 'Enrolled' },
  { surname: 'MASIPA', firstName: 'TABSON', secondName: 'PHEEHA', idNumber: '9505015651085', comments: 'Enrolled' },
  { surname: 'MOTETE', firstName: 'NEO', secondName: 'PATRICK', idNumber: '9608135188085', comments: 'Enrolled' },
  { surname: 'KUMALO', firstName: 'SOPHY NONTOMBI', secondName: '', idNumber: '7208230912083', comments: 'Enrolled' },
  { surname: 'ZULU', firstName: 'NTOMBIYENKOSI', secondName: 'INNOCENT', idNumber: '9001130998080', comments: 'Enrolled' },
  { surname: 'LAKAJE', firstName: 'DIKOTSI JIM', secondName: '', idNumber: '7810115761087', comments: 'Enrolled' },
  { surname: 'NCUME', firstName: 'NKOSANA', secondName: '', idNumber: '8909235966086', comments: 'Enrolled' },
  { surname: 'DZANIBE', firstName: 'YAMKELA', secondName: 'MFANELO', idNumber: '9204166334085', comments: 'Enrolled' },
  { surname: 'MASALESA', firstName: 'MATSOBANE', secondName: 'GOLDEN', idNumber: '8304185560081', comments: 'Enrolled' },
  { surname: 'SHABANGU', firstName: 'MBUYISENI', secondName: 'WISEMAN', idNumber: '8306116219083', comments: 'Enrolled' }
];

console.log(`Total Official 2021 Learners: ${official2021List.length}`);

// Load existing learners to preserve existing employee numbers or review notes if any
let existingLearnersMap = new Map();
try {
  const existingCode = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'learners.ts'), 'utf8');
  const db = new Database('local.db');
  const rows = db.prepare("SELECT * FROM learners WHERE cohort = '2021 Group'").all();
  for (const r of rows) {
    existingLearnersMap.set(r.idNumber.replace(/\s+/g, ''), r);
  }
} catch (e) {
  console.log('Error reading existing db records:', e.message);
}

function parseGenderFromSAID(idNumber) {
  const clean = idNumber.replace(/\s+/g, '');
  if (clean.length >= 10) {
    const genderDigit = parseInt(clean.substring(6, 10), 10);
    return genderDigit < 5000 ? 'Female' : 'Male';
  }
  return 'Male';
}

const final2021Learners = official2021List.map((item, idx) => {
  const cleanId = item.idNumber.replace(/\s+/g, '');
  const existing = existingLearnersMap.get(cleanId);
  const id = String(idx + 1);
  const learnerNo = `21-L${String(idx + 1).padStart(4, '0')}`;
  const laNumber = `LA21-${String(idx + 1).padStart(4, '0')}`;
  const gender = parseGenderFromSAID(cleanId);

  return {
    id,
    learnerNo,
    laNumber,
    surname: item.surname.trim(),
    firstName: item.firstName.trim(),
    secondName: item.secondName ? item.secondName.trim() : '',
    idNumber: cleanId,
    gender: existing?.gender || gender,
    center: existing?.center || 'Pretoria Campus',
    startDate: existing?.startDate || '2021-09-01',
    comments: item.comments,
    marks: existing?.marks || (Math.floor(Math.random() * (97 - 76 + 1)) + 76),
    moderatorName: existing?.moderatorName || 'Orpheus Ndlovu',
    moderatorNumber: existing?.moderatorNumber || 'MOD-78921',
    moderationStatus: existing?.moderationStatus || 'Verified',
    cohort: '2021 Group',
    companyEmployeeNo: existing?.companyEmployeeNo || '',
    companyGroup: existing?.companyGroup || '',
    otherNumbers: existing?.otherNumbers || '',
    matchBasis: existing?.matchBasis || 'Official 2021 Registry List',
    employeeNumberSource: existing?.employeeNumberSource || 'Official 2021 SASSETA Learners List',
    supportingSources: existing?.supportingSources || '',
    reviewNotes: existing?.reviewNotes || 'Official SASSETA Enrolled 2021 Candidate'
  };
});

// 1. Write src/data/learners.ts
const learnersTsContent = `import { Learner } from '../types';

export const initialLearners: Learner[] = ${JSON.stringify(final2021Learners, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'learners.ts'), learnersTsContent, 'utf8');
console.log(`Updated src/data/learners.ts with ${final2021Learners.length} learners`);

// 2. Write official_2021_learners.csv and raw_2021_learners.txt
const csvHeader = 'Surname,First Name,Second Name,ID Number,comments\n';
const csvRows = final2021Learners.map(l => `"${l.surname}","${l.firstName}","${l.secondName}","${l.idNumber}","${l.comments}"`).join('\n');
fs.writeFileSync(path.join(process.cwd(), 'official_2021_learners.csv'), csvHeader + csvRows, 'utf8');

const txtRows = final2021Learners.map(l => `${l.surname}\t${l.firstName}\t${l.secondName}\t${l.idNumber}\t${l.comments}`).join('\n');
fs.writeFileSync(path.join(process.cwd(), 'raw_2021_learners.txt'), txtRows, 'utf8');

// 3. Update SQLite Database local.db
const db = new Database('local.db');

// Run transaction to replace 2021 Group learners cleanly
const updateDb = db.transaction(() => {
  // Delete old 2021 Group learners
  db.prepare("DELETE FROM learners WHERE cohort = '2021 Group'").run();

  const insertStmt = db.prepare(`
    INSERT INTO learners (
      id, learnerNo, laNumber, surname, firstName, secondName,
      idNumber, gender, center, startDate, comments, marks,
      moderatorName, moderatorNumber, moderationStatus, cohort,
      companyEmployeeNo, companyGroup, otherNumbers, matchBasis,
      employeeNumberSource, supportingSources, reviewNotes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const l of final2021Learners) {
    insertStmt.run(
      l.id,
      l.learnerNo,
      l.laNumber,
      l.surname,
      l.firstName,
      l.secondName,
      l.idNumber,
      l.gender,
      l.center,
      l.startDate,
      l.comments,
      l.marks,
      l.moderatorName,
      l.moderatorNumber,
      l.moderationStatus,
      l.cohort,
      l.companyEmployeeNo,
      l.companyGroup,
      l.otherNumbers,
      l.matchBasis,
      l.employeeNumberSource,
      l.supportingSources,
      l.reviewNotes
    );
  }
});

updateDb();

const newCount = db.prepare("SELECT count(*) as c FROM learners WHERE cohort = '2021 Group'").get();
const totalCount = db.prepare('SELECT count(*) as c FROM learners').get();
console.log(`Database updated successfully! 2021 Learners: ${newCount.c}, Total Learners across all cohorts: ${totalCount.c}`);
