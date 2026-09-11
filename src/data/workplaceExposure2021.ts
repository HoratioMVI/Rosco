import { WorkplaceScheduleRecord } from '../types.js';

export interface WorkplaceLearnerItem {
  learnerNo: string;
  name: string;
  username: string;
  idNumber: string;
}

export interface WorkplaceUnitStandardItem {
  usId: string;
  title: string;
  startWeek2: string;
  endWeek2: string;
  startWeek3: string;
  endWeek3: string;
  startWeek4: string;
  endWeek4: string;
  assessor: string;
}

export const workplaceLearnersList: WorkplaceLearnerItem[] = [
  { learnerNo: "L001", name: "COLLEN LEFTY APHANE", username: "8309225923082 \\ | LA21/012266", idNumber: "8309225923082" },
  { learnerNo: "L002", name: "CALFONIA BALOGI", username: "9008180536082 \\ | LA21/008900", idNumber: "9008180536082" },
  { learnerNo: "L003", name: "SIBONGILE MILLCENT BALOYI", username: "8608290881087 \\ | LA21/008826", idNumber: "8608290881087" },
  { learnerNo: "L004", name: "NGOAKO JIM BOTABOTA", username: "8809125332086 \\ | LA21/010820", idNumber: "8809125332086" },
  { learnerNo: "L005", name: "THOBANI BUTHELEZI", username: "9504056056080 \\ | LA21/011370", idNumber: "9504056056080" },
  { learnerNo: "L006", name: "DINGANI WALTER CHAKA", username: "7801195473081 \\ | LA21/010881", idNumber: "7801195473081" },
  { learnerNo: "L007", name: "MIKE BOB CHAUKE", username: "8404176196083 \\ | LA21/012041", idNumber: "8404176196083" },
  { learnerNo: "L008", name: "MOLOKO GODSON CHOSHI", username: "8204276415080 \\ | LA21/006229", idNumber: "8204276415080" },
  { learnerNo: "L009", name: "SYLVERIOUS HLANGANANI CIBANE", username: "8904275512080 \\ | LA21/008514", idNumber: "8904275512080" },
  { learnerNo: "L010", name: "SITHEMBISO PRINCE CIKWAYO", username: "9004055540085 \\ | LA21/008893", idNumber: "9004055540085" },
  { learnerNo: "L011", name: "MARIA NTSOAKI DHLADHLA", username: "8501140387084 \\ | LA21/010895", idNumber: "8501140387084" },
  { learnerNo: "L012", name: "AVIWE DIBILE", username: "9811206331085 \\ | LA21/004458", idNumber: "9811206331085" },
  { learnerNo: "L013", name: "MMAMODIBEDI PETRUNIA DITSHEGO", username: "9109280663089 \\ | LA21/008651", idNumber: "9109280663089" },
  { learnerNo: "L014", name: "YAMKELA MFANELO DZANIBE", username: "9204166334085 \\ | LA21/010749", idNumber: "9204166334085" },
  { learnerNo: "L015", name: "COLLIN GUMEDE", username: "8305056697084 \\ | LA21/010615", idNumber: "8305056697084" },
  { learnerNo: "L016", name: "DUMAZI FREDRIC HLOPHE", username: "8503275863087 \\ | LA21/008723", idNumber: "8503275863087" },
  { learnerNo: "L017", name: "MATOME PRINCE HLUNGWANI", username: "9304126142089 \\ | LA21/004434", idNumber: "9304126142089" },
  { learnerNo: "L018", name: "MKHUSELI EMMANUEL JAKUJA", username: "9102195813089 \\ | LA21/009075", idNumber: "9102195813089" },
  { learnerNo: "L019", name: "THOMAS OUPA KEKANA", username: "7701265635082 \\ | LA21/010719", idNumber: "7701265635082" },
  { learnerNo: "L020", name: "COLLECTION MOHEMO KGAPULE", username: "9312035576081 \\ | LA21/010662", idNumber: "9312035576081" },
  { learnerNo: "L021", name: "SYDNEY THABO KGOMO", username: "8504305332085 \\ | LA21/0011026", idNumber: "8504305332085" },
  { learnerNo: "L022", name: "DINAH NTSOAKI KHOPHOCHE", username: "9008100412083 \\ | LA21/012194", idNumber: "9008100412083" },
  { learnerNo: "L023", name: "BUSISIWE KHUMALO", username: "8608030710083 \\ | LA21/004445", idNumber: "8608030710083" },
  { learnerNo: "L024", name: "VELANI ANDREW KIET", username: "7206275898084 \\ | LA21/011015", idNumber: "7206275898084" },
  { learnerNo: "L025", name: "MEADOLANDS MOSES KOMANA", username: "7810075392089 \\ | LA21/010780", idNumber: "7810075392089" },
  { learnerNo: "L026", name: "RADITLALE KUBJANA", username: "6906025737083 \\ | LA21/010841", idNumber: "6906025737083" },
  { learnerNo: "L027", name: "SOPHY NONTOMBI KUMALO", username: "7208230912083 \\ | LA21/012172", idNumber: "7208230912083" },
  { learnerNo: "L028", name: "DIKOTSI JIM LAKAJE", username: "7810115761087 \\ | LA21/012061", idNumber: "7810115761087" },
  { learnerNo: "L029", name: "SAMUEL LEBOMBO", username: "8303265382085 \\ | LA21/010874", idNumber: "8303265382085" },
  { learnerNo: "L030", name: "ITUMELENG INNOCENTIA LENKA", username: "8701131053089 \\ | LA21/012075", idNumber: "8701131053089" },
  { learnerNo: "L031", name: "KOLOBE CHRISTOPHER LETLALO", username: "7505055385083 \\ | LA21/011503", idNumber: "7505055385083" },
  { learnerNo: "L032", name: "VUSUMUZI SAMSON LUKHELE", username: "7712095555085 \\ | LA21/011008", idNumber: "7712095555085" },
  { learnerNo: "L033", name: "JANTRY THULANI MABIZELA", username: "7908045958086 \\ | LA21/012178", idNumber: "7908045958086" },
  { learnerNo: "L034", name: "KWENA MARIA MABOKELA", username: "7802240408080 \\ | LA21/012609", idNumber: "7802240408080" },
  { learnerNo: "L035", name: "FIKILE MADIKANE", username: "8804175970083 \\ | LA21/011746", idNumber: "8804175970083" },
  { learnerNo: "L036", name: "BULELWA MADLIWA", username: "9104211011086 \\ | LA21/011475", idNumber: "9104211011086" },
  { learnerNo: "L037", name: "SIMANGELE MADONDO", username: "8809031198084 \\ | LA21/011752", idNumber: "8809031198084" },
  { learnerNo: "L038", name: "ASSENT MAENETJA", username: "9512170872084 \\ | LA21/004486", idNumber: "9512170872084" },
  { learnerNo: "L039", name: "TSHEPO CONFIDENCE MAGABA", username: "8208305502081 \\ | LA21/011791", idNumber: "8208305502081" },
  { learnerNo: "L040", name: "TSHIFIWA ELISAH MAHAFHA", username: "7602150908081 \\ | LA21/00856", idNumber: "7602150908081" },
  { learnerNo: "L041", name: "PERCY LEFA MAHLANGU", username: "9211205598083 \\ | LA21/010784", idNumber: "9211205598083" },
  { learnerNo: "L042", name: "MANDISA MAKA", username: "9112251424085 \\ | LA21/011775", idNumber: "9112251424085" },
  { learnerNo: "L043", name: "MODUPI ISAIAH MAKGATA", username: "8709045784087 \\ | LA21/011016", idNumber: "8709045784087" },
  { learnerNo: "L044", name: "AUDREY MAKHUBELA", username: "9104210600087 \\ | LA21/012029", idNumber: "9104210600087" },
  { learnerNo: "L045", name: "MARTHA MAKGOKOLOTSE MAKOENA", username: "7207271033080 \\ | LA21/012195", idNumber: "7207271033080" },
  { learnerNo: "L046", name: "NGETA AARON MAKOU", username: "8412296111080 \\ | LA21/010748", idNumber: "8412296111080" },
  { learnerNo: "L047", name: "MARUPING T MALALE", username: "8212291130089 \\ | LA21/012171", idNumber: "8212291130089" },
  { learnerNo: "L048", name: "JACOB TSHEPISO MALAPANE", username: "8806175490087 \\ | LA21/011023", idNumber: "8806175490087" },
  { learnerNo: "L049", name: "MORONGOE JULIA MALEFANE", username: "7001110374080 \\ | LA21/008425", idNumber: "7001110374080" },
  { learnerNo: "L050", name: "THULANE MICHAEL MALEKA", username: "7112275457089 \\ | LA21/010980", idNumber: "7112275457089" },
  { learnerNo: "L051", name: "MALESELA JONIUS MALETE", username: "8310255352085 \\ | LA21/012093", idNumber: "8310255352085" },
  { learnerNo: "L052", name: "PETER MALULEKA", username: "8707295551081 \\ | LA21/004456", idNumber: "8707295551081" },
  { learnerNo: "L053", name: "HLUPHEKA JEFREY MALULEKE", username: "7801135327082 \\ | LA21/011979", idNumber: "7801135327082" },
  { learnerNo: "L054", name: "PHINDIWE SYLVIA MANYAKANYAKA", username: "7209161127089 \\ | LA21/011191", idNumber: "7209161127089" },
  { learnerNo: "L055", name: "MOEKETSI METHWES MAOKE", username: "8602055857085 \\ | LA21/012170", idNumber: "8602055857085" },
  { learnerNo: "L056", name: "SARAH MAPHANGA", username: "8609141263087 \\ | LA21/011506", idNumber: "8609141263087" },
  { learnerNo: "L057", name: "MAESELA ISHMAEL MAPHOSO", username: "7501265512087 \\ | LA21/011018", idNumber: "7501265512087" },
  { learnerNo: "L058", name: "MAGEDI OBADIEL MAPODILE", username: "7104165464085 \\ | LA21/010786", idNumber: "7104165464085" },
  { learnerNo: "L059", name: "MAROPE WILLIAM MARIBENG", username: "8402085800084 \\ | LA21/012040", idNumber: "8402085800084" },
  { learnerNo: "L060", name: "KGATEDI NICCOLUS MARIPANE", username: "7810245336081 \\ | LA21/011909", idNumber: "7810245336081" },
  { learnerNo: "L061", name: "MATSOBANE GOLDEN MASALESA", username: "8304185560081 \\ | LA21/008759", idNumber: "8304185560081" },
  { learnerNo: "L062", name: "EVANS MASEMOLA", username: "9511165820082 \\ | LA21/009927", idNumber: "9511165820082" },
  { learnerNo: "L063", name: "KHATALANI M'CCATHY MASHAVA", username: "7903075974087 \\ | LA21/008775", idNumber: "7903075974087" },
  { learnerNo: "L064", name: "KHOMOTSO HUMPHEREY MASHILOANE", username: "8110065547084 \\ | LA21/011003", idNumber: "8110065547084" },
  { learnerNo: "L065", name: "ISAAC SHORTY MASILELA", username: "9405146108081 \\ | LA21/009823", idNumber: "9405146108081" },
  { learnerNo: "L066", name: "TABSON PHEEHA MASIPA", username: "9505015651085 \\ | LA21/009824", idNumber: "9505015651085" },
  { learnerNo: "L067", name: "JULIA SESIANA MATENTJE", username: "8202221215084 \\ | LA21/008588", idNumber: "8202221215084" },
  { learnerNo: "L068", name: "THOMAS MATHEBULA", username: "7310265528089 \\ | LA21/012106", idNumber: "7310265528089" },
  { learnerNo: "L069", name: "DONALD SUMBA MATHEBULA", username: "7005135511089 \\ | LA21/011326", idNumber: "7005135511089" },
  { learnerNo: "L070", name: "SHADRACK THABO MATJOKANE", username: "7909235674087 \\ | LA21/010214", idNumber: "7909235674087" },
  { learnerNo: "L071", name: "TSHEPO KOTI MATLALA", username: "8807246078083 \\ | LA21/006221", idNumber: "8807246078083" },
  { learnerNo: "L072", name: "NEO REJOYCE MATLHOKO", username: "7904220877084 \\ | LA21/012196", idNumber: "7904220877084" },
  { learnerNo: "L073", name: "THULISILE CYNTHIA MAZIBUKO", username: "8705291108088 \\ | LA21/011831", idNumber: "8705291108088" },
  { learnerNo: "L074", name: "GIFT THABO MAZIYA", username: "9809185353088 \\ | LA21/004457", idNumber: "9809185353088" },
  { learnerNo: "L075", name: "SABELO SYDNEY MBHELE", username: "8701275636087 \\ | LA21/011689", idNumber: "8701275636087" },
  { learnerNo: "L076", name: "MCEBO MCHUNU", username: "9008205667086 \\ | LA21/012187", idNumber: "9008205667086" },
  { learnerNo: "L077", name: "NYIKO CHRIS MDLULI", username: "8003305446086 \\ | LA21/011516", idNumber: "8003305446086" },
  { learnerNo: "L078", name: "EMMANUEL MEKGWE", username: "9309126237086 \\ | LA21/012090", idNumber: "9309126237086" },
  { learnerNo: "L079", name: "EVELYN RAMATSIMELA MELLO", username: "8509280637085 \\ | LA21/010104", idNumber: "8509280637085" },
  { learnerNo: "L080", name: "TLOU GODWIN MESO", username: "7409105567081 \\ | LA21/012260", idNumber: "7409105567081" },
  { learnerNo: "L081", name: "GETRUDE NOMALANGA MHLANGA", username: "7804120457088 \\ | LA21/011505", idNumber: "7804120457088" },
  { learnerNo: "L082", name: "LUNGISANI MHLWANA", username: "9205156083087 \\ | LA21/611261", idNumber: "9205156083087" },
  { learnerNo: "L083", name: "MBHEKENI ZAMA MKHWANAZI", username: "7605056737082 \\ | LA21/010564", idNumber: "7605056737082" },
  { learnerNo: "L084", name: "SIMON TSHEPO MKWANAZI", username: "8407076343085 \\ | LA21/004428", idNumber: "8407076343085" },
  { learnerNo: "L085", name: "MUNYARADZI CHARLES MLAMBO", username: "9308125144087 \\ | LA21/008611", idNumber: "9308125144087" },
  { learnerNo: "L086", name: "NANGAMSO MLATA", username: "9209151507082 \\ | LA21/010754", idNumber: "9209151507082" },
  { learnerNo: "L087", name: "REVIS MOABO", username: "8204185439080 \\ | LA21/012261", idNumber: "8204185439080" },
  { learnerNo: "L088", name: "MANGWENG JOSIA MOATSHE", username: "7307305347082 \\ | LA21/012206", idNumber: "7307305347082" },
  { learnerNo: "L089", name: "SERWANYE SOPHONIA MOATSHE", username: "8508065911087 \\ | LA21/010824", idNumber: "8508065911087" },
  { learnerNo: "L090", name: "DONALD JONATHAN MOEKETSI", username: "9105116171081 \\ | LA21/011110", idNumber: "9105116171081" },
  { learnerNo: "L091", name: "MAKUANE JOSEPH MOEKETSI", username: "6802125338080 \\ | LA21/011235", idNumber: "6802125338080" },
  { learnerNo: "L092", name: "GEORGE MOGALE", username: "7603015817087 \\ | LA21/008769", idNumber: "7603015817087" },
  { learnerNo: "L093", name: "MOSES MOSHE MOHALE", username: "9003146346080 \\ | LA21/011944", idNumber: "9003146346080" },
  { learnerNo: "L094", name: "STEVEN MOHLAMONYANE", username: "9307305354086 \\ | LA21/008507", idNumber: "9307305354086" },
  { learnerNo: "L095", name: "JOHANNES RAMMULE MOITSE", username: "9101205551085 \\ | LA21/004753", idNumber: "9101205551085" },
  { learnerNo: "L096", name: "NKHENSANI EDITH MOKASE", username: "8506090536085 \\ | LA21/011761", idNumber: "8506090536085" },
  { learnerNo: "L097", name: "DAVID MONAHENA MOKHANTSO", username: "7101115807082 \\ | LA21/011880", idNumber: "7101115807082" },
  { learnerNo: "L098", name: "RAMOGANENG MARGARET MOKOBAKI", username: "8805140615083 \\ | LA21/004440", idNumber: "8805140615083" },
  { learnerNo: "L099", name: "SIMPHIWE PERFECT MOKOENA", username: "8908205808088 \\ | LA21/009181", idNumber: "8908205808088" },
  { learnerNo: "L100", name: "JOHANNES MOKOTEDI", username: "8503115386083 \\ | LA21/008842", idNumber: "8503115386083" },
  { learnerNo: "L101", name: "RODNEY MALATSWA MOLEPO", username: "7708115358088 \\ | LA21/011727", idNumber: "7708115358088" },
  { learnerNo: "L102", name: "NKWANE KHUTSO MOLOTO", username: "9204285863089 \\ | LA21/008580", idNumber: "9204285863089" },
  { learnerNo: "L103", name: "MAHLATSE MOKGADI MORUDU", username: "9306050264086 \\ | LA21/00875", idNumber: "9306050264086" },
  { learnerNo: "L104", name: "RASENOANE ALPHEUS MORUMUDI", username: "9606165267084 \\ | LA21/011735", idNumber: "9606165267084" },
  { learnerNo: "L105", name: "PHETOLE SOLOMON MOTAU", username: "6704025443087 \\ | LA21/008767", idNumber: "6704025443087" },
  { learnerNo: "L106", name: "NEO PATRICK MOTETE", username: "9608135188085 \\ | LA21/010002", idNumber: "9608135188085" },
  { learnerNo: "L107", name: "MASIXOLE MPEHLA", username: "9603195734084", idNumber: "9603195734084" },
  { learnerNo: "L108", name: "MPHASI JOHANNES MPORO", username: "8909125385082 \\ | LA21/011010", idNumber: "8909125385082" },
  { learnerNo: "L109", name: "SIBONGILE MARIA MSIMANGO", username: "8401310927084 \\ | LA21/007952", idNumber: "8401310927084" },
  { learnerNo: "L110", name: "NKOSIVUMILE JERONE MTHATHAMBI", username: "8904216167085 \\ | LA21/011709", idNumber: "8904216167085" },
  { learnerNo: "L111", name: "BHEKITHEMBA NHLAKANIPHO MTHEMBU", username: "8904185716086 \\ | LA21/010045", idNumber: "8904185716086" },
  { learnerNo: "L112", name: "AELVIS MTHETHO", username: "6606156047084 \\ | LA21/011004", idNumber: "6606156047084" },
  { learnerNo: "L113", name: "FREDDY MADIMETJA MTHIMUNYE", username: "9206275434086 \\ | LA21/101722", idNumber: "9206275434086" },
  { learnerNo: "L114", name: "NDIVHUHO MUDZANANI", username: "8908121204081 \\ | LA21/011807", idNumber: "8908121204081" },
  { learnerNo: "L115", name: "MASHUDU MULAUDZI", username: "9203061004082 \\ | LA21/011986", idNumber: "9203061004082" },
  { learnerNo: "L116", name: "KAGISO MUNYAI", username: "9907045409080 \\ | LA21/008836", idNumber: "9907045409080" },
  { learnerNo: "L117", name: "MUSHONI PERCY MUSEKWA", username: "9202276302083 \\ | LA21/012089", idNumber: "9202276302083" },
  { learnerNo: "L118", name: "MKHULISENI EDMOND MYENI", username: "8107255810082 \\ | LA21/009942", idNumber: "8107255810082" },
  { learnerNo: "L119", name: "DIFANO SIYANDA MZELEMU", username: "9111235973084 \\ | LA21/009149", idNumber: "9111235973084" },
  { learnerNo: "L120", name: "PHILISWA MZINDA", username: "8710210453086 \\ | LA21/011191", idNumber: "8710210453086" },
  { learnerNo: "L121", name: "BUSISWA VERONICA MZINZILI", username: "8802130990089 \\ | LA21/011773", idNumber: "8802130990089" },
  { learnerNo: "L122", name: "LEHLOGONOLO KOMANE NCHABELENG", username: "9205176198089 \\ | LA21/012034", idNumber: "9205176198089" },
  { learnerNo: "L123", name: "NKOSANA NCUME", username: "8909235966086 \\ | LA21/006244", idNumber: "8909235966086" },
  { learnerNo: "L124", name: "SIPHO AFRICA NDLOVU", username: "8509106776083 \\ | LA21/009183", idNumber: "8509106776083" },
  { learnerNo: "L125", name: "DZIVHULUWANI KENETH NEGOGOGO", username: "8303106204084 \\ | LA21/010864", idNumber: "8303106204084" },
  { learnerNo: "L126", name: "BONGINKOSI MICHAEL NGCOBO", username: "8908036163083 \\ | LA21/009171", idNumber: "8908036163083" },
  { learnerNo: "L127", name: "THABISILE NESSI NGCOBO", username: "8305210413089 \\ | LA21/009917", idNumber: "8305210413089" },
  { learnerNo: "L128", name: "PHUTHUMA NGCWAMA", username: "7907240554088 \\ | LA21011246", idNumber: "7907240554088" },
  { learnerNo: "L129", name: "LORRAINE NGHONYAMA", username: "9005120679089 \\ | LA21/008653", idNumber: "9005120679089" },
  { learnerNo: "L130", name: "YUZA RODGERS NGOMANE", username: "7302055934080 \\ | LA22/059275", idNumber: "7302055934080" },
  { learnerNo: "L131", name: "THEMBINKOSI WALTER NGOZO", username: "9305135919086 \\ | LA21/008896", idNumber: "9305135919086" },
  { learnerNo: "L132", name: "MYEZO NJUZA", username: "9609176603081 \\ | LA21/011309", idNumber: "9609176603081" },
  { learnerNo: "L133", name: "SIBONISILE PRINCE NKOHLA", username: "9103306184089 \\ | LA21/010295", idNumber: "9103306184089" },
  { learnerNo: "L134", name: "VUSI NKOSI", username: "8508045215088 \\ | LA21/012193", idNumber: "8508045215088" },
  { learnerNo: "L135", name: "LAZARUS JUSTICE NKUNA", username: "7904075929089 \\ | LA21/012227", idNumber: "7904075929089" },
  { learnerNo: "L136", name: "PULENG ANDRIES NKWANA", username: "8905025772080 \\ | LA21/011713", idNumber: "8905025772080" },
  { learnerNo: "L137", name: "SIBONGISENI LINDINKOSI NKWANYANYANA", username: "8510295596084 \\ | LA21/011097", idNumber: "8510295596084" },
  { learnerNo: "L138", name: "JIM LEPADIMANA SELLO PHALA", username: "9702015434089 \\ | LA21/011794", idNumber: "9702015434089" },
  { learnerNo: "L139", name: "ZOLANI SAM PITER", username: "7312257134082 \\ | LA21/011508", idNumber: "7312257134082" },
  { learnerNo: "L140", name: "MANTWA PATRICIA RABOROKO", username: "9010081055089 \\ | LA21/010556", idNumber: "9010081055089" },
  { learnerNo: "L141", name: "TUMISI SONNYBOY RAKGALAKANA", username: "7501026465088 \\ | LA21/012265", idNumber: "7501026465088" },
  { learnerNo: "L142", name: "SHIMANE JOHANNES RAKGOTHO", username: "9605085464086 \\ | LA21/011014", idNumber: "9605085464086" },
  { learnerNo: "L143", name: "SABATA LUCAS RAMASILO", username: "8806265256083 \\ | LA21/010587", idNumber: "8806265256083" },
  { learnerNo: "L144", name: "MADUMANE REBECCA RAMAUDE", username: "9009190935082 \\ | LA21/008830", idNumber: "9009190935082" },
  { learnerNo: "L145", name: "NTHANGENI THOMAS RAMUKHUBA", username: "6507076221082 \\ | LA21/009905", idNumber: "6507076221082" },
  { learnerNo: "L146", name: "NTEBALENG GLORIA RAPAPALI", username: "8110310537088 \\ | LA21/012233", idNumber: "8110310537088" },
  { learnerNo: "L147", name: "GLORIA MOLOGADI SAMBO", username: "8107300499089 \\ | LA21/008646", idNumber: "8107300499089" },
  { learnerNo: "L148", name: "ANDREW SEALE", username: "6806095778084 \\ | LA21/011975", idNumber: "6806095778084" },
  { learnerNo: "L149", name: "MATOME ELIAS SEANEGO", username: "7809025909083 \\ | LA21/012207", idNumber: "7809025909083" },
  { learnerNo: "L150", name: "KGAAUGELO SEFOLO", username: "9604255747081 \\ | LA21/011626", idNumber: "9604255747081" },
  { learnerNo: "L151", name: "SONTI CLASS SEKGOTA", username: "7708115646086 \\ | LA21/012010", idNumber: "7708115646086" },
  { learnerNo: "L152", name: "MADIBE EVONNE SELANE", username: "8111240758083 \\ | LA21/013846", idNumber: "8111240758083" },
  { learnerNo: "L153", name: "SEKEDI CHRISTINAH SEMOSA", username: "8801070832087 \\ | LA21/011648", idNumber: "8801070832087" },
  { learnerNo: "L154", name: "MALETSANE PETRUS SHABALALA", username: "7807145312089 \\ | LA21/012164", idNumber: "7807145312089" },
  { learnerNo: "L155", name: "MBUYISENI WISEMAN SHABANGU", username: "8306116219083 \\ | LA21/007965", idNumber: "8306116219083" },
  { learnerNo: "L156", name: "LUNGISANI MVELO SHANDU", username: "9107265696082 \\ | LA21/009136", idNumber: "9107265696082" },
  { learnerNo: "L157", name: "NKHENSANI CHARLES SHIBAMBU", username: "7912285474085 \\ | LA21/011916", idNumber: "7912285474085" },
  { learnerNo: "L158", name: "CEBO SINYANYA", username: "9001016449083 \\ | LA21/009879", idNumber: "9001016449083" },
  { learnerNo: "L159", name: "GLENDAR SIRAFHA", username: "9007220595082 \\ | LA21/011928", idNumber: "9007220595082" },
  { learnerNo: "L160", name: "MHLENGI SITHOLE", username: "9310046379081 \\ | LA21/011017", idNumber: "9310046379081" },
  { learnerNo: "L161", name: "MPHO SIWELANE", username: "9709265275088 \\ | LA21/010164", idNumber: "9709265275088" },
  { learnerNo: "L162", name: "TELLO JACOB SOSIBO", username: "8207085346081 \\ | LA21/006245", idNumber: "8207085346081" },
  { learnerNo: "L163", name: "LIZZY THANDIWE SPEL", username: "8203151098086 \\ | LA21/008995", idNumber: "8203151098086" },
  { learnerNo: "L164", name: "ASEMAHLE TASE", username: "8806291014084 \\ | LA21/011192", idNumber: "8806291014084" },
  { learnerNo: "L165", name: "JOTHAM VICTOR THABETHE", username: "7406045579085 \\ | LA21/011483", idNumber: "7406045579085" },
  { learnerNo: "L166", name: "NTOMBIFUTHI PRETTY THWALA", username: "8209020597083 \\ | LA21/012188", idNumber: "8209020597083" },
  { learnerNo: "L167", name: "PAUL TLOU", username: "7903035448081 \\ | LA21/008593", idNumber: "7903035448081" },
  { learnerNo: "L168", name: "TSHEPO TSHABALALA", username: "9006066303080 \\ | LA21/011013", idNumber: "9006066303080" },
  { learnerNo: "L169", name: "MODISE JAMES TSHABALALA", username: "6805195470089 \\ | LA21/009681", idNumber: "6805195470089" },
  { learnerNo: "L170", name: "NONKULULEKO MERRIAM TSHALI", username: "9103151244087 \\ | LA21/011208", idNumber: "9103151244087" },
  { learnerNo: "L171", name: "ZUKILE CHRISTOPHER TSHAPHA", username: "7611115755081 \\ | LA21/010226", idNumber: "7611115755081" },
  { learnerNo: "L172", name: "THABO ABEL TSHIFARO", username: "8311285746080 \\ | LA21/008819", idNumber: "8311285746080" },
  { learnerNo: "L173", name: "IRENE VAN VOOR", username: "8310255385085 \\ | LA21/011981", idNumber: "8310255385085" },
  { learnerNo: "L174", name: "NTOMBIYENKOSI INNOCENT ZULU", username: "9001130998080 \\ | LA21/006246", idNumber: "9001130998080" },
  { learnerNo: "L175", name: "BENJAMIN SIMPHIWE ZULU", username: "7306215810080 \\ | LA21/009695", idNumber: "7306215810080" },
  { learnerNo: "L176", name: "MZWANDILE SIMON ZWANE", username: "8409205448082 \\ | LA21/008583", idNumber: "8409205448082" }
];

export const workplaceUnitStandardsList: WorkplaceUnitStandardItem[] = [
  { 
    usId: "246694", 
    title: "Explain the requirements for becoming a security service provider", 
    startWeek2: "11 Jan 2021 00:00", endWeek2: "15 Jan 2021 00:00", 
    startWeek3: "18 Jan 2021 00:00", endWeek3: "22 Jan 2021 00:00",
    startWeek4: "25 Jan 2021 00:00", endWeek4: "29 Jan 2021 00:00",
    assessor: "Boitumelo Mosidi" 
  },
  { 
    usId: "244184", 
    title: "Apply legal aspects in a security environment", 
    startWeek2: "11 Jan 2021 00:00", endWeek2: "15 Jan 2021 00:00", 
    startWeek3: "18 Jan 2021 00:00", endWeek3: "22 Jan 2021 00:00",
    startWeek4: "25 Jan 2021 00:00", endWeek4: "29 Jan 2021 00:00",
    assessor: "Faith Ramoshaba" 
  },
  { 
    usId: "244182", 
    title: "Give evidence in court", 
    startWeek2: "11 Jan 2021 00:00", endWeek2: "15 Jan 2021 00:00", 
    startWeek3: "18 Jan 2021 00:00", endWeek3: "22 Jan 2021 00:00",
    startWeek4: "25 Jan 2021 00:00", endWeek4: "29 Jan 2021 00:00",
    assessor: "Sandile Mthimkhulu" 
  },
  { 
    usId: "244176", 
    title: "Use security equipment", 
    startWeek2: "08 Feb 2021 00:00", endWeek2: "12 Feb 2021 00:00", 
    startWeek3: "15 Feb 2021 00:00", endWeek3: "19 Feb 2021 00:00",
    startWeek4: "22 Feb 2021 00:00", endWeek4: "26 Feb 2021 00:00",
    assessor: "Xavier Kruger" 
  },
  { 
    usId: "244181", 
    title: "Perform hand over and take over responsibilities", 
    startWeek2: "08 Feb 2021 00:00", endWeek2: "12 Feb 2021 00:00", 
    startWeek3: "15 Feb 2021 00:00", endWeek3: "19 Feb 2021 00:00",
    startWeek4: "22 Feb 2021 00:00", endWeek4: "26 Feb 2021 00:00",
    assessor: "Eugene Ramoshaba" 
  },
  { 
    usId: "244177", 
    title: "Conduct a security patrol in an area of responsibility", 
    startWeek2: "08 Feb 2021 00:00", endWeek2: "12 Feb 2021 00:00", 
    startWeek3: "15 Feb 2021 00:00", endWeek3: "19 Feb 2021 00:00",
    startWeek4: "22 Feb 2021 00:00", endWeek4: "26 Feb 2021 00:00",
    assessor: "Orpheus Ndlovu" 
  },
  { 
    usId: "244179", 
    title: "Handle complaints and problems", 
    startWeek2: "08 Mar 2021 00:00", endWeek2: "12 Mar 2021 00:00", 
    startWeek3: "15 Mar 2021 00:00", endWeek3: "19 Mar 2021 00:00",
    startWeek4: "22 Mar 2021 00:00", endWeek4: "26 Mar 2021 00:00",
    assessor: "Boitumelo Mosidi" 
  },
  { 
    usId: "13912", 
    title: "Apply knowledge of self and team to develop a plan to enhance team performance", 
    startWeek2: "08 Mar 2021 00:00", endWeek2: "12 Mar 2021 00:00", 
    startWeek3: "15 Mar 2021 00:00", endWeek3: "19 Mar 2021 00:00",
    startWeek4: "22 Mar 2021 00:00", endWeek4: "26 Mar 2021 00:00",
    assessor: "Faith Ramoshaba" 
  },
  { 
    usId: "244189", 
    title: "Conduct access and egress control", 
    startWeek2: "08 Mar 2021 00:00", endWeek2: "12 Mar 2021 00:00", 
    startWeek3: "15 Mar 2021 00:00", endWeek3: "19 Mar 2021 00:00",
    startWeek4: "22 Mar 2021 00:00", endWeek4: "26 Mar 2021 00:00",
    assessor: "Sandile Mthimkhulu" 
  },
  { 
    usId: "242825", 
    title: "Conduct evacuations and emergency drills", 
    startWeek2: "08 Mar 2021 00:00", endWeek2: "12 Mar 2021 00:00", 
    startWeek3: "15 Mar 2021 00:00", endWeek3: "19 Mar 2021 00:00",
    startWeek4: "22 Mar 2021 00:00", endWeek4: "26 Mar 2021 00:00",
    assessor: "Xavier Kruger" 
  },
  { 
    usId: "11505", 
    title: "Identify, handle and defuse security-related conflict", 
    startWeek2: "08 Mar 2021 00:00", endWeek2: "12 Mar 2021 00:00", 
    startWeek3: "15 Mar 2021 00:00", endWeek3: "19 Mar 2021 00:00",
    startWeek4: "22 Mar 2021 00:00", endWeek4: "26 Mar 2021 00:00",
    assessor: "Eugene Ramoshaba" 
  },
  { 
    usId: "117705", 
    title: "Demonstrate knowledge of the Firearms Control Act, 2000 applicable to possessing a firearm", 
    startWeek2: "08 Mar 2021 00:00", endWeek2: "12 Mar 2021 00:00", 
    startWeek3: "15 Mar 2021 00:00", endWeek3: "19 Mar 2021 00:00",
    startWeek4: "22 Mar 2021 00:00", endWeek4: "26 Mar 2021 00:00",
    assessor: "Orpheus Ndlovu" 
  },
  { 
    usId: "119465", 
    title: "Write, present or sign texts for a range of communicative contexts", 
    startWeek2: "12 Apr 2021 00:00", endWeek2: "16 Apr 2021 00:00", 
    startWeek3: "19 Apr 2021 00:00", endWeek3: "23 Apr 2021 00:00",
    startWeek4: "26 Apr 2021 00:00", endWeek4: "30 Apr 2021 00:00",
    assessor: "Boitumelo Mosidi" 
  },
  { 
    usId: "113852", 
    title: "Apply occupational health, safety and environmental principles", 
    startWeek2: "12 Apr 2021 00:00", endWeek2: "16 Apr 2021 00:00", 
    startWeek3: "19 Apr 2021 00:00", endWeek3: "23 Apr 2021 00:00",
    startWeek4: "26 Apr 2021 00:00", endWeek4: "30 Apr 2021 00:00",
    assessor: "Faith Ramoshaba" 
  },
  { 
    usId: "11508", 
    title: "Write security reports and take statements", 
    startWeek2: "12 Apr 2021 00:00", endWeek2: "16 Apr 2021 00:00", 
    startWeek3: "19 Apr 2021 00:00", endWeek3: "23 Apr 2021 00:00",
    startWeek4: "26 Apr 2021 00:00", endWeek4: "30 Apr 2021 00:00",
    assessor: "Sandile Mthimkhulu" 
  },
  { 
    usId: "119472", 
    title: "Accommodate audience and context needs in oral or signed communication", 
    startWeek2: "10 May 2021 00:00", endWeek2: "14 May 2021 00:00", 
    startWeek3: "17 May 2021 00:00", endWeek3: "21 May 2021 00:00",
    startWeek4: "24 May 2021 00:00", endWeek4: "28 May 2021 00:00",
    assessor: "Xavier Kruger" 
  },
  { 
    usId: "114941", 
    title: "Apply knowledge of HIV/AIDS to a specific business sector and workplace", 
    startWeek2: "10 May 2021 00:00", endWeek2: "14 May 2021 00:00", 
    startWeek3: "17 May 2021 00:00", endWeek3: "21 May 2021 00:00",
    startWeek4: "24 May 2021 00:00", endWeek4: "28 May 2021 00:00",
    assessor: "Eugene Ramoshaba" 
  },
  { 
    usId: "9010", 
    title: "Use number bases and measurement units and recognise calculation error", 
    startWeek2: "10 May 2021 00:00", endWeek2: "14 May 2021 00:00", 
    startWeek3: "17 May 2021 00:00", endWeek3: "21 May 2021 00:00",
    startWeek4: "24 May 2021 00:00", endWeek4: "28 May 2021 00:00",
    assessor: "Orpheus Ndlovu" 
  },
  { 
    usId: "9012", 
    title: "Investigate life and work-related problems using data and probabilities", 
    startWeek2: "14 Jun 2021 00:00", endWeek2: "18 Jun 2021 00:00", 
    startWeek3: "21 Jun 2021 00:00", endWeek3: "25 Jun 2021 00:00",
    startWeek4: "28 Jun 2021 00:00", endWeek4: "02 Jul 2021 00:00",
    assessor: "Boitumelo Mosidi" 
  },
  { 
    usId: "9013", 
    title: "Describe, apply, analyse and calculate shape and motion in two- and three-dimensional space", 
    startWeek2: "14 Jun 2021 00:00", endWeek2: "18 Jun 2021 00:00", 
    startWeek3: "21 Jun 2021 00:00", endWeek3: "25 Jun 2021 00:00",
    startWeek4: "28 Jun 2021 00:00", endWeek4: "02 Jul 2021 00:00",
    assessor: "Faith Ramoshaba" 
  },
  { 
    usId: "7456", 
    title: "Use mathematics to investigate and monitor personal, business and national financial issues", 
    startWeek2: "14 Jun 2021 00:00", endWeek2: "18 Jun 2021 00:00", 
    startWeek3: "21 Jun 2021 00:00", endWeek3: "25 Jun 2021 00:00",
    startWeek4: "28 Jun 2021 00:00", endWeek4: "02 Jul 2021 00:00",
    assessor: "Sandile Mthimkhulu" 
  },
  { 
    usId: "119457", 
    title: "Interpret and use information from texts", 
    startWeek2: "12 Jul 2021 00:00", endWeek2: "16 Jul 2021 00:00", 
    startWeek3: "19 Jul 2021 00:00", endWeek3: "23 Jul 2021 00:00",
    startWeek4: "26 Jul 2021 00:00", endWeek4: "30 Jul 2021 00:00",
    assessor: "Xavier Kruger" 
  },
  { 
    usId: "119467", 
    title: "Use language and communication in occupational learning programmes", 
    startWeek2: "12 Jul 2021 00:00", endWeek2: "16 Jul 2021 00:00", 
    startWeek3: "19 Jul 2021 00:00", endWeek3: "23 Jul 2021 00:00",
    startWeek4: "26 Jul 2021 00:00", endWeek4: "30 Jul 2021 00:00",
    assessor: "Eugene Ramoshaba" 
  }
];

export function generateWorkplaceRecords(week: number = 2): WorkplaceScheduleRecord[] {
  const records: WorkplaceScheduleRecord[] = [];
  const weekPrefix = week === 2 ? '5' : week === 3 ? '6' : '7';
  const activityType = `Workplace Exposure Week ${week}`;

  workplaceLearnersList.forEach((learner, lIdx) => {
    workplaceUnitStandardsList.forEach((us, uIdx) => {
      const seq = lIdx * 23 + uIdx + 1;
      const recordId = `${weekPrefix}-${String(seq).padStart(5, '0')}`;
      
      const start = week === 2 ? us.startWeek2 : week === 3 ? us.startWeek3 : us.startWeek4;
      const end = week === 2 ? us.endWeek2 : week === 3 ? us.endWeek3 : us.endWeek4;

      records.push({
        id: recordId,
        learnerNo: learner.learnerNo,
        learnerName: learner.name,
        learnerIdNumber: learner.idNumber,
        learnerUsername: learner.username,
        usId: us.usId,
        unitStandardTitle: us.title,
        activityType,
        week,
        scheduledStart: start,
        scheduledEnd: end,
        actualLogin: '',
        actualLogout: '',
        evidenceSource: '',
        evidenceReference: '',
        verificationStatus: 'Awaiting Evidence',
        verifiedBy: '',
        assessorMentor: us.assessor
      });
    });
  });

  return records;
}

export const workplaceExposureWeek2Data: WorkplaceScheduleRecord[] = generateWorkplaceRecords(2);
