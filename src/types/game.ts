export type GameScreenState = 'TITLE_MENU' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

export type ActiveTab = 'STORY' | 'STREET' | 'HOME' | 'FINANCE' | 'CASINO';

export interface StoryChoiceOption {
  id: string;
  label: string;
  description: string;
  karmaType: 'CHINH_DAO' | 'GIANG_HO';
  cashDelta: number;
  reputationDelta: number;
  sanityDelta: number;
  maiAnhDelta: number;
  underworldDelta: number;
  familyDebtReduction: number;
  outcomeText: string;
}

export interface StoryChapter {
  chapterNumber: number;
  title: string;
  subtitle: string;
  bannerType: 'HOMETOWN' | 'CONFRONTATION' | 'STREET';
  introDialogue: {
    speaker: string;
    role: string;
    text: string;
  }[];
  objectivesSummary: string[];
  choices: StoryChoiceOption[];
}

export interface StoryProgress {
  currentChapter: number; // 1..5 (6 = Completed Campaign)
  familyDebtRemaining: number; // Khởi đầu 150.000.000 ₫ nợ đất hương hỏa ở quê
  moneySentHomeTotal: number;
  maiAnhAffection: number; // 0..100
  underworldRespect: number; // 0..100
  karmaPath: 'CHINH_DAO' | 'GIANG_HO' | 'CAN_BANG';
  completedChapters: number[];
  endingTitle: string | null;
  activeEndingId?: string | null;
}

export interface WifeCandidate {
  id: string;
  name: string;
  role: string;
  personality: string;
  description: string;
  minAffectionToMarry: number;
  minReputation: number;
  reqHousingNonSlum: boolean;
  reqAssetId?: string;
  weddingCost: number;
  dowryAndGiftRange: [number, number]; // Tiền mừng cưới + của hồi môn nhận lại
  dailyIncomeHelp: number;
  dailySanityBonus: number;
  dailyHealthBonus: number;
}

export interface ChildMember {
  id: string;
  name: string;
  gender: 'Trai' | 'Gái';
  birthDay: number;
  ageStage: 'Sơ Sinh' | 'Mẫu Giáo' | 'Tiểu Học' | 'Trưởng Thành';
  smartPoints: number; // Điểm thông minh / ngoan ngoãn
  happiness: number; // 0..100
}

export interface FamilyState {
  affectionMap: Record<string, number>; // Điểm tình cảm với từng cô gái
  marriedWifeId: string | null;
  weddingDay: number | null;
  maritalHappiness: number; // 0..100
  children: ChildMember[];
}

export interface LifeEnding {
  id: string;
  code: string;
  title: string;
  category: 'BI_KICH' | 'GIANG_HO' | 'VIEN_MAN' | 'HUYEN_THOAI';
  subtitle: string;
  storyText: string;
  conditionHint: string;
}

export interface JobOption {
  id: string;
  title: string;
  category: string;
  description: string;
  basePay: number;
  energyCost: number;
  stressCost: number;
  reqAssetId?: string;
  reqReputation?: number;
  expGain: number;
}

export interface FoodOrServiceItem {
  id: string;
  name: string;
  spot: string;
  cost: number;
  energyRestore: number;
  healthRestore: number;
  sanityRestore: number;
  description: string;
}

export interface HousingTier {
  id: string;
  name: string;
  dailyRent: number;
  purchasePrice?: number;
  dailyEnergyBonus: number;
  dailySanityBonus: number;
  reputationBonus: number;
  description: string;
}

export interface AssetItem {
  id: string;
  name: string;
  category: 'Xe Cộ' | 'Công Nghệ' | 'Vàng & Trang Sức' | 'Bất Động Sản';
  price: number;
  pawnValue: number; // 75% of price
  dailyPassiveIncome: number;
  reputationBonus: number;
  description: string;
}

export interface OwnedAsset {
  assetId: string;
  isPawned: boolean;
  pawnedDay?: number;
}

export interface SharkLoanPackage {
  id: string;
  name: string;
  lenderName: string;
  principal: number;
  upfrontCutPercent: number; // Cắt lãi trước
  dailyInterestRate: number; // e.g., 0.05 = 5%/ngày
  durationDays: number;
  description: string;
  threatText: string;
}

export interface ActiveSharkLoan {
  packageId: string;
  name: string;
  lenderName: string;
  principal: number;
  accruedInterest: number;
  dailyInterestRate: number;
  borrowedDay: number;
  dueDay: number;
  overdueDays: number;
}

export interface RandomLifeEvent {
  id: string;
  title: string;
  description: string;
  choices: {
    label: string;
    outcomeText: string;
    cashDelta: number;
    healthDelta: number;
    sanityDelta: number;
    energyDelta: number;
    reputationDelta: number;
  }[];
}

export interface JournalEntry {
  id: string;
  day: number;
  timeStr?: string; // Ví dụ: "08:30"
  title: string;
  detail: string;
  type: 'info' | 'positive' | 'negative' | 'danger' | 'casino' | 'diary';
  isUserWritten?: boolean;
  mood?: string;
}

export interface CareerRank {
  rankIndex: number;
  title: string;
  minExp: number;
  minReputation: number;
  reqCourseId?: string;
  payMultiplier: number;
  dailyBaseSalary: number; // Lương cứng thụ động nhận mỗi ngày khi đạt cấp quản lý
  perkText: string;
}

export interface TrainingCourse {
  id: string;
  name: string;
  institution: string;
  cost: number;
  energyCost: number;
  expBonus: number;
  reputationBonus: number;
  description: string;
}

export interface InvestmentChannel {
  id: string;
  code: string;
  name: string;
  category: 'Chứng Khoán' | 'Vàng & Kim Khí' | 'Tiền Số' | 'Kinh Doanh Nhượng Quyền' | 'Bất Động Sản Số';
  baseUnitPrice: number;
  minVolatility: number; // e.g., -0.06
  maxVolatility: number; // e.g., +0.08
  dailyDividendRate: number; // Cổ tức/lợi tức thụ động mỗi ngày
  riskLabel: string;
  description: string;
}

export interface PortfolioHolding {
  channelId: string;
  units: number;
  avgBuyPrice: number;
}

export interface CharacterBackground {
  id: string;
  title: string;
  tagline: string;
  description: string;
  startingCash: number;
  startingSavings: number;
  startingRep: number;
  startingExp: number;
  startingMaxEnergy: number;
  startingUnderworld: number;
  startingMaiAnh: number;
}

export interface PlayerState {
  name: string;
  hometown: string;
  backgroundId: string;
  backgroundTitle: string;
  day: number;
  age: number;
  cash: number;
  bankSavings: number;
  bankDebt: number;
  bankDebtDueDay: number | null;
  sharkLoans: ActiveSharkLoan[];
  health: number;
  maxHealth: number;
  sanity: number;
  energy: number;
  maxEnergy: number;
  reputation: number; // Uy tín xã hội & điểm tín dụng CIC (0 - 100)
  workExp: number;
  careerRankIndex: number; // 0..4 (Thực tập -> Giám đốc)
  completedCourseIds: string[];
  portfolio: PortfolioHolding[];
  marketPrices: Record<string, number>;
  marketChanges: Record<string, number>; // % thay đổi phiên gần nhất
  housingId: string;
  ownedHousingIds: string[];
  assets: OwnedAsset[];
  story: StoryProgress;
  family: FamilyState;
  stats: {
    totalEarnedWork: number;
    totalWonCasino: number;
    totalLostCasino: number;
    baCayRounds: number;
    liengRounds: number;
    taiXiuRounds: number;
  };
}

export const JOBS_DATA: JobOption[] = [
  {
    id: 'phat_to_roi',
    title: 'Phát Tờ Rơi Ngã Tư',
    category: 'Lao Động Phổ Thông',
    description: 'Đứng dưới nắng phát tờ rơi khai trương quán trà sữa và bất động sản ở ngã tư đèn đỏ.',
    basePay: 180_000,
    energyCost: 25,
    stressCost: 8,
    expGain: 5,
  },
  {
    id: 'phu_quan_pho',
    title: 'Bưng Bê Quán Phở Gia Truyền',
    category: 'Dịch Vụ Ẩm Thực',
    description: 'Bưng phở nóng, dọn bàn, thái hành từ sáng sớm. Được bao ăn sáng miễn phí.',
    basePay: 260_000,
    energyCost: 30,
    stressCost: 10,
    expGain: 8,
  },
  {
    id: 'phu_ho',
    title: 'Phụ Hồ Công Trình',
    category: 'Xây Dựng',
    description: 'Xách vữa, trộn bê tông, khuân gạch. Vất vả tốn sức nhưng tiền công trả tươi cuối buổi.',
    basePay: 420_000,
    energyCost: 45,
    stressCost: 14,
    expGain: 12,
  },
  {
    id: 'xe_om_cong_nghe',
    title: 'Tài Xế Xe Ôm Công Nghệ',
    category: 'Vận Tải Đường Phố',
    description: 'Khoác áo xanh chạy chở khách và giao đồ ăn khắp các ngõ ngách Sài Gòn - Hà Nội.',
    basePay: 580_000,
    energyCost: 35,
    stressCost: 12,
    reqAssetId: 'xe_wave',
    expGain: 15,
  },
  {
    id: 'freelance_media',
    title: 'Dựng Video & Chạy Quảng Cáo',
    category: 'Công Nghệ & Sáng Tạo',
    description: 'Nhận job edit video ngắn, thiết kế banner và quản lý fanpage cho các shop thời trang.',
    basePay: 950_000,
    energyCost: 30,
    stressCost: 18,
    reqAssetId: 'laptop_gaming',
    reqReputation: 45,
    expGain: 22,
  },
  {
    id: 'moi_gioi_bds',
    title: 'Môi Giới Bất Động Sản Phố Cổ',
    category: 'Kinh Doanh Cao Cấp',
    description: 'Dẫn khách đại gia đi xem đất nền và nhà mặt phố, chốt hoa hồng tiền triệu mỗi ca.',
    basePay: 2_200_000,
    energyCost: 35,
    stressCost: 22,
    reqAssetId: 'xe_sh',
    reqReputation: 65,
    expGain: 35,
  },
];

export const STREET_FOOD_DATA: FoodOrServiceItem[] = [
  {
    id: 'tra_da_via_he',
    name: 'Trà Đá & Hướng Dương Vỉa Hè',
    spot: 'Quán Nước Cô Tư',
    cost: 15_000,
    energyRestore: 12,
    healthRestore: 2,
    sanityRestore: 10,
    description: 'Ngồi ghế nhựa đỏ hóng gió, nghe chuyện thời sự khu phố, giải tỏa căng thẳng.',
  },
  {
    id: 'banh_mi_pate',
    name: 'Bánh Mì Đặc Ruột Pate Trứng',
    spot: 'Xe Bánh Mì Đầu Ngõ',
    cost: 30_000,
    energyRestore: 28,
    healthRestore: 5,
    sanityRestore: 5,
    description: 'Giòn rụm, đầy ắp pate gan, dưa góp và tương ớt cay nồng giúp lấy lại sức nhanh.',
  },
  {
    id: 'pho_bo_tai_lan',
    name: 'Phở Bò Tái Nạm Gầu Đặc Biệt',
    spot: 'Phở Thìn Gia Truyền',
    cost: 65_000,
    energyRestore: 48,
    healthRestore: 12,
    sanityRestore: 14,
    description: 'Nước dùng ninh xương ngọt lịm, thêm quẩy giòn tan, hồi phục thể lực tuyệt vời.',
  },
  {
    id: 'com_tam_suon',
    name: 'Cơm Tấm Sườn Bì Chả Trứng Ốp',
    spot: 'Cơm Tấm Đêm Sài Gòn',
    cost: 75_000,
    energyRestore: 55,
    healthRestore: 10,
    sanityRestore: 12,
    description: 'Miếng sườn nướng than hoa thơm phức ngập mỡ hành, chắc bụng cả ngày dài.',
  },
  {
    id: 'bia_hoi_lau_nuong',
    name: 'Chầu Bia Hơi & Lẩu Nướng Vỉa Hè',
    spot: 'Quán Nhậu Chiến Hữu',
    cost: 250_000,
    energyRestore: 30,
    healthRestore: -4,
    sanityRestore: 38,
    description: 'Zô 100% cùng anh em chiến hữu! Quên sạch âu lo cơm áo gạo tiền.',
  },
  {
    id: 'kham_benh_vien',
    name: 'Gói Khám & Truyền Đạm Đa Khoa',
    spot: 'Bệnh Viện Đa Khoa Quận',
    cost: 650_000,
    energyRestore: 40,
    healthRestore: 45,
    sanityRestore: 15,
    description: 'Bác sĩ kiểm tra tổng quát, kê đơn thuốc bổ và truyền dịch hồi phục sức khỏe.',
  },
];

export const HOUSING_DATA: HousingTier[] = [
  {
    id: 'phong_tro_mai_ton',
    name: 'Phòng Trọ Mái Tôn Xóm Lao Động',
    dailyRent: 50_000,
    dailyEnergyBonus: 65,
    dailySanityBonus: -2,
    reputationBonus: 0,
    description: 'Gác xép 12m², buổi trưa hơi hầm nóng nhưng giá rẻ, hàng xóm thân thiện.',
  },
  {
    id: 'chung_cu_mini',
    name: 'Chung Cư Mini Có Điều Hòa',
    dailyRent: 150_000,
    dailyEnergyBonus: 85,
    dailySanityBonus: 6,
    reputationBonus: 10,
    description: 'Phòng khép kín 30m², có máy lạnh mát rượi, thang máy và hầm để xe an ninh.',
  },
  {
    id: 'can_ho_cao_cap',
    name: 'Căn Hộ Chung Cư Cao Cấp',
    dailyRent: 450_000,
    purchasePrice: 95_000_000,
    dailyEnergyBonus: 100,
    dailySanityBonus: 15,
    reputationBonus: 25,
    description: 'View toàn cảnh thành phố, bể bơi nội khu, ngủ dậy tràn đầy năng lượng và đẳng cấp.',
  },
  {
    id: 'biet_thu_pho',
    name: 'Biệt Thự Sân Vườn Mặt Phố',
    dailyRent: 1_200_000,
    purchasePrice: 350_000_000,
    dailyEnergyBonus: 100,
    dailySanityBonus: 28,
    reputationBonus: 45,
    description: 'Đỉnh cao giới thượng lưu Việt Nam, gara rộng rãi, khẳng định vị thế đại gia.',
  },
];

export const ASSETS_DATA: AssetItem[] = [
  {
    id: 'xe_wave',
    name: 'Xe Số Honda Wave Alpha',
    category: 'Xe Cộ',
    price: 12_000_000,
    pawnValue: 9_000_000,
    dailyPassiveIncome: 0,
    reputationBonus: 8,
    description: 'Chiếc xe quốc dân bền bỉ, tiết kiệm xăng. Cần thiết để chạy Xe Ôm Công Nghệ.',
  },
  {
    id: 'laptop_gaming',
    name: 'Laptop Đồ Họa & Livestream',
    category: 'Công Nghệ',
    price: 22_000_000,
    pawnValue: 16_500_000,
    dailyPassiveIncome: 120_000,
    reputationBonus: 10,
    description: 'Cấu hình mạnh mẽ để nhận việc dựng video, quảng cáo và kiếm thêm thu nhập thụ động.',
  },
  {
    id: 'vang_sjc',
    name: 'Cây Vàng Miếng SJC 9999',
    category: 'Vàng & Trang Sức',
    price: 45_000_000,
    pawnValue: 38_000_000,
    dailyPassiveIncome: 250_000,
    reputationBonus: 15,
    description: 'Tài sản tích trữ an toàn chuẩn truyền thống, dễ dàng cầm cố hoặc thanh khoản.',
  },
  {
    id: 'xe_sh',
    name: 'Xe Tay Ga Honda SH 150i ABS',
    category: 'Xe Cộ',
    price: 68_000_000,
    pawnValue: 51_000_000,
    dailyPassiveIncome: 0,
    reputationBonus: 22,
    description: 'Biểu tượng sành điệu đường phố. Mở khóa nghề Môi Giới Bất Động Sản thu nhập khủng.',
  },
  {
    id: 'xe_oto_sedan',
    name: 'Ô Tô Sedan Hạng D Sang Trọng',
    category: 'Xe Cộ',
    price: 180_000_000,
    pawnValue: 135_000_000,
    dailyPassiveIncome: 850_000,
    reputationBonus: 30,
    description: 'Che mưa che nắng, vừa đi giao dịch vừa cho thuê xe hoa cuối tuần.',
  },
  {
    id: 'so_do_dat_nen',
    name: 'Sổ Đỏ Lô Đất Mặt Tiền Vùng Ven',
    category: 'Bất Động Sản',
    price: 300_000_000,
    pawnValue: 225_000_000,
    dailyPassiveIncome: 2_100_000,
    reputationBonus: 40,
    description: 'Cho thuê mặt bằng kinh doanh quán cà phê, mang lại dòng tiền lớn mỗi ngày.',
  },
];

export const SHARK_LOAN_PACKAGES: SharkLoanPackage[] = [
  {
    id: 'bat_ho_nho',
    name: 'Bát Họ Sinh Viên (10 Triệu)',
    lenderName: 'Tiệm Cầm Đồ Anh Long Rồng Đỏ',
    principal: 10_000_000,
    upfrontCutPercent: 10, // Cắt phế 1 triệu, cầm về 9 triệu
    dailyInterestRate: 0.05, // 5% / ngày
    durationDays: 7,
    description: 'Thủ tục 1 phút chỉ cần chụp CCCD. Cắt lãi trước 10% (nhận 9.000.000 ₫), lãi 5%/ngày.',
    threatText: 'Quá hạn là đàn em qua tận xóm trọ dán tờ rơi và tạt sơn mắm tôm!',
  },
  {
    id: 'vay_nong_vip',
    name: 'Bát Họ Tốc Hành (35 Triệu)',
    lenderName: 'Tài Chính Anh Tuấn Cá Chép',
    principal: 35_000_000,
    upfrontCutPercent: 10,
    dailyInterestRate: 0.06, // 6% / ngày
    durationDays: 7,
    description: 'Dành cho anh em cần vốn gỡ gạc chiếu bạc. Nhận ngay 31.500.000 ₫, lãi 6%/ngày.',
    threatText: 'Trễ hẹn một ngày là có 4 thanh niên xăm trổ đứng đợi trước cửa phòng!',
  },
  {
    id: 'cam_mang_do_den',
    name: 'Gói Cắm Mạng Đại Gia (100 Triệu)',
    lenderName: 'Ông Trùm Hải Phòng',
    principal: 100_000_000,
    upfrontCutPercent: 12,
    dailyInterestRate: 0.08, // 8% / ngày
    durationDays: 6,
    description: 'Vay nóng 100 triệu giải ngân trong đêm (nhận 88.000.000 ₫). Lãi cắt cổ 8%/ngày.',
    threatText: 'Quá hạn sẽ bị cưỡng chế tài sản và trừ mạnh Sức Khỏe mỗi ngày!',
  },
];

export const RANDOM_EVENTS: RandomLifeEvent[] = [
  {
    id: 'dam_cuoi_ban_than',
    title: 'Thiệp Hồng Đám Cưới Bạn Cấp 3',
    description: 'Thằng bạn học chung cấp 3 suốt 5 năm không liên lạc bỗng nhiên nhắn tin: "Bạn ơi tuần này mình cưới, nhớ đến chung vui nhé!"',
    choices: [
      {
        label: 'Mừng phong bì 500.000 ₫ & đi ăn cỗ',
        outcomeText: 'Bạn đi ăn cỗ đầy đủ, gặp lại hội bạn cũ vui vẻ và tăng thêm mối quan hệ xã hội!',
        cashDelta: -500_000,
        healthDelta: 5,
        sanityDelta: 15,
        energyDelta: 15,
        reputationDelta: 8,
      },
      {
        label: 'Báo bận đột xuất, giữ tiền trong túi',
        outcomeText: 'Bạn tiết kiệm được 500k nhưng bị hội bạn bàn tán là sống thiếu tình nghĩa.',
        cashDelta: 0,
        healthDelta: 0,
        sanityDelta: -4,
        energyDelta: 0,
        reputationDelta: -5,
      },
    ],
  },
  {
    id: 'bat_duoc_vi_tien',
    title: 'Nhặt Được Ví Da Trên Vỉa Hè',
    description: 'Đang đi bộ gần quán trà đá thì bạn thấy một chiếc ví da rơi cạnh gốc cây bàng, bên trong có xấp tiền mặt và giấy tờ tùy thân.',
    choices: [
      {
        label: 'Liên hệ trả lại người mất',
        outcomeText: 'Chủ nhân chiếc ví vô cùng cảm kích, hậu tạ bạn 400.000 ₫ và đăng bài khen ngợi người tốt việc tốt!',
        cashDelta: 400_000,
        healthDelta: 0,
        sanityDelta: 18,
        energyDelta: -5,
        reputationDelta: 12,
      },
      {
        label: 'Lặng lẽ đút túi 1.200.000 ₫ tiền mặt',
        outcomeText: 'Có thêm món tiền bất ngờ nhưng trong lòng hơi thấp thỏm lo camera an ninh quay trúng.',
        cashDelta: 1_200_000,
        healthDelta: 0,
        sanityDelta: -12,
        energyDelta: 0,
        reputationDelta: -10,
      },
    ],
  },
  {
    id: 'mua_ngap_duong',
    title: 'Mưa Lớn Ngập Đường Giờ Tan Tầm',
    description: 'Cơn mưa rào chiều tối khiến tuyến đường về nhà ngập sâu nửa bánh xe, hàng loạt xe máy bị chết máy.',
    choices: [
      {
        label: 'Xắn quần phụ đẩy xe giúp mọi người',
        outcomeText: 'Một bác chủ tiệm vàng được bạn đẩy xe giúp đã tặng bạn 300.000 ₫ uống trà gừng ấm bụng!',
        cashDelta: 300_000,
        healthDelta: -5,
        sanityDelta: 12,
        energyDelta: -15,
        reputationDelta: 9,
      },
      {
        label: 'Tấp vào quán cà phê trú mưa (50.000 ₫)',
        outcomeText: 'Ngồi nhâm nhi cà phê sữa nóng ngắm mưa rơi, giữ gìn sức khỏe an toàn.',
        cashDelta: -50_000,
        healthDelta: 2,
        sanityDelta: 10,
        energyDelta: 10,
        reputationDelta: 0,
      },
    ],
  },
  {
    id: 'co_dat_ru_re',
    title: 'Cò Đất Rủ Góp Vốn Lướt Cọc',
    description: 'Ông anh quen ở quán bia rỉ tai: "Anh có suất đất ngộp chính chủ cần lướt cọc 24h, chú góp 2 triệu mai chia lãi đôi!"',
    choices: [
      {
        label: 'Xuống tiền góp 2.000.000 ₫ thử vận may',
        outcomeText: 'Chốt khách thành công! Ông anh chia ngay cho bạn 3.200.000 ₫ tiền lời nóng hổi!',
        cashDelta: 1_200_000,
        healthDelta: 0,
        sanityDelta: 10,
        energyDelta: -5,
        reputationDelta: 3,
      },
      {
        label: 'Từ chối thẳng thừng cho chắc ăn',
        outcomeText: 'Giữ chặt tiền trong túi, không sợ rủi ro bánh vẽ.',
        cashDelta: 0,
        healthDelta: 0,
        sanityDelta: 4,
        energyDelta: 0,
        reputationDelta: 1,
      },
    ],
  },
];

export const CHARACTER_BACKGROUNDS: CharacterBackground[] = [
  {
    id: 'sinh_vien_moi_ra_truong',
    title: 'Cử Nhân Mới Ra Trường',
    tagline: 'Tri thức trẻ · Uy tín CIC cao · Lên lương nhanh',
    description:
      'Tốt nghiệp đại học với tấm bằng loại khá nhưng gia đình ở quê gặp biến cố. Có sẵn kiến thức nền tảng và điểm tín dụng tốt để dễ dàng vay vốn ngân hàng.',
    startingCash: 3_000_000,
    startingSavings: 1_000_000,
    startingRep: 68,
    startingExp: 45,
    startingMaxEnergy: 100,
    startingUnderworld: 5,
    startingMaiAnh: 15,
  },
  {
    id: 'lao_dong_tinh_le',
    title: 'Trai Quê Chịu Thương Chịu Khó',
    tagline: 'Thể lực dồi dào 120/120 · Quen việc nặng nhọc',
    description:
      'Rời lũy tre làng lên thành phố với đôi bàn tay trắng nhưng sức vóc hơn người, có thể cày nhiều ca phụ hồ, chạy xe ôm liên tục không biết mệt.',
    startingCash: 2_200_000,
    startingSavings: 500_000,
    startingRep: 55,
    startingExp: 20,
    startingMaxEnergy: 120,
    startingUnderworld: 10,
    startingMaiAnh: 10,
  },
  {
    id: 'lang_tu_chieu_bac',
    title: 'Lãng Tử Chiếu Bạc Khét Tiếng',
    tagline: 'Vốn tiền mặt dày 6 Triệu · Độ nể giang hồ cao',
    description:
      'Từng lăn lộn khắp các sới 3 Cây, Liêng và Tài Xỉu. Nhạy bén với những canh bạc tất tay và được đàn anh ngoài xã hội nể nang từ ngày đầu.',
    startingCash: 6_000_000,
    startingSavings: 0,
    startingRep: 42,
    startingExp: 10,
    startingMaxEnergy: 100,
    startingUnderworld: 35,
    startingMaiAnh: 5,
  },
  {
    id: 'con_nha_gia_giao_sa_co',
    title: 'Thiếu Gia Sa Cơ Lỡ Vận',
    tagline: 'Sổ tiết kiệm 3.5 Triệu · Duyên ăn nói & Uy tín 75',
    description:
      'Gia đình từng khá giả ở quê trước khi bị Lão Hạc lừa gạt. Phong thái đĩnh đạc giúp bạn dễ dàng chiếm cảm tình của Mai Anh và vay hạn mức cao tại VietBank.',
    startingCash: 3_500_000,
    startingSavings: 3_500_000,
    startingRep: 75,
    startingExp: 25,
    startingMaxEnergy: 100,
    startingUnderworld: 5,
    startingMaiAnh: 25,
  },
];

export const STORY_CHAPTERS_DATA: StoryChapter[] = [
  {
    chapterNumber: 1,
    title: 'Chương 1: Cuộc Gọi Nửa Đêm Từ Quê Nhà',
    subtitle: 'Khởi đầu giông bão & đồng tiền viện phí đầu tiên báo hiếu cha mẹ',
    bannerType: 'HOMETOWN',
    introDialogue: [
      {
        speaker: 'Bà Lan (Mẹ ở quê)',
        role: 'Cuộc gọi đường dài lúc 23h30',
        text: 'Alo con trai à... Bố mày ở quê bị nhóm cò đất của Lão Hạc lừa ký giấy vay nặng lãi 150 triệu thế chấp mảnh đất hương hỏa của tổ tiên. Chiều nay chủ nợ kéo đến đập phá làm bố mày tăng huyết áp phải cấp cứu ở bệnh viện tỉnh rồi con ơi!',
      },
      {
        speaker: 'Nhân Vật Chính',
        role: 'Đứng lặng dưới mái tôn phòng trọ',
        text: 'Mẹ bình tĩnh chờ con! Con đang ở trên thành phố, dù phải thức ngày cày đêm hay làm bất cứ nghề gì, con nhất định sẽ gửi tiền viện phí về cứu bố và chuộc lại mảnh đất của gia đình mình!',
      },
    ],
    objectivesSummary: [
      'Gửi về quê tối thiểu 3.000.000 ₫ tiền viện phí đợt đầu cho bố mẹ',
      'Tích lũy ít nhất 20 EXP làm việc HOẶC trải nghiệm 2 ván tại Chiếu Bạc',
    ],
    choices: [
      {
        id: 'ch1_chinh_dao',
        label: 'Con Đường Chính Đạo: Chăm chỉ làm thêm & giữ chữ tín',
        description:
          'Nhận làm tăng ca ban đêm ở quán phở và giữ hồ sơ tín dụng sạch để chuẩn bị vay vốn lập nghiệp (+1.500.000 ₫ thưởng chuyên cần, +10 Uy tín CIC, +15 Tình cảm Mai Anh).',
        karmaType: 'CHINH_DAO',
        cashDelta: 1_500_000,
        reputationDelta: 10,
        sanityDelta: 8,
        maiAnhDelta: 15,
        underworldDelta: 0,
        familyDebtReduction: 0,
        outcomeText:
          'Bố bạn đã qua cơn nguy kịch! Mai Anh ở đầu ngõ rất cảm phục ý chí tự lập của bạn.',
      },
      {
        id: 'ch1_giang_ho',
        label: 'Con Đường Tốc Chiến: Theo chân Hùng Bến Cảng vào sới ngầm',
        description:
          'Nhận lời làm chân canh sới bạc đêm cho Hùng Bến Cảng để lấy tiền tươi tức khắc (+3.000.000 ₫ tiền lộc, +20 Độ nể giang hồ, -5 Uy tín CIC).',
        karmaType: 'GIANG_HO',
        cashDelta: 3_000_000,
        reputationDelta: -5,
        sanityDelta: -4,
        maiAnhDelta: 0,
        underworldDelta: 20,
        familyDebtReduction: 0,
        outcomeText:
          'Bạn có ngay 3 triệu tiền tươi từ giới giang hồ và bắt đầu hiểu luật ngầm của những chiếu 3 Cây, Liêng.',
      },
    ],
  },
  {
    chapterNumber: 2,
    title: 'Chương 2: Bóng Hồng Xóm Trọ & Đôi Chân Vạn Dặm',
    subtitle: 'Sắm phương tiện làm ăn & trả đợt lãi quê nhà đầu tiên',
    bannerType: 'STREET',
    introDialogue: [
      {
        speaker: 'Mai Anh (Cô hàng xóm bán cà phê vợt)',
        role: 'Buổi sáng sớm đầu ngõ xóm trọ',
        text: 'Anh uống ly cà phê nâu đá cho tỉnh táo nhé. Em nghe bác tổ trưởng kể chuyện gia đình anh ở quê rồi. Ở thành phố này muốn kiếm tiền triệu mỗi ngày thì phải sắm lấy chiếc xe máy chạy khách hoặc chiếc laptop làm truyền thông anh ạ!',
      },
      {
        speaker: 'Hùng "Bến Cảng"',
        role: 'Tay anh chị khu chợ đêm',
        text: 'Chú em có chí khí đấy! Nhưng nhớ lời anh: Lão Hạc giữ giấy nợ đất của bố chú không phải tay vừa đâu. Chuẩn bị phương tiện và thực lực đi, sắp tới sẽ có biến lớn!',
      },
    ],
    objectivesSummary: [
      'Mua sở hữu ít nhất 1 Tài sản / Phương tiện (Xe Wave Alpha, Laptop, Vàng SJC...)',
      'Tổng tiền đã gửi về quê đạt tối thiểu 15.000.000 ₫ (Giảm nợ quê nhà xuống ≤ 135 Triệu)',
      'Đạt Tình cảm Mai Anh ≥ 25 HOẶC Độ nể giang hồ ≥ 25',
    ],
    choices: [
      {
        id: 'ch2_mai_anh',
        label: 'Hợp tác cùng Mai Anh mở rộng tiệm cà phê & giao hàng',
        description:
          'Dùng phương tiện mới cùng Mai Anh bỏ mối cà phê rang xay cho các văn phòng (+4.000.000 ₫ lợi nhuận, +20 Tình cảm Mai Anh, +10 Uy tín CIC).',
        karmaType: 'CHINH_DAO',
        cashDelta: 4_000_000,
        reputationDelta: 10,
        sanityDelta: 15,
        maiAnhDelta: 20,
        underworldDelta: 0,
        familyDebtReduction: 5_000_000,
        outcomeText:
          'Công việc kinh doanh phụ cùng Mai Anh suôn sẻ, cô ấy còn phụ bạn gửi thêm 5 triệu trả bớt nợ ở quê!',
      },
      {
        id: 'ch2_anh_long',
        label: 'Đầu quân làm quân sư thu họ cho Anh Long Rồng Đỏ',
        description:
          'Dùng sự nhạy bén để giúp tiệm cầm đồ Anh Long đòi các khoản nợ khó đòi (+6.500.000 ₫ hoa hồng nóng, +25 Độ nể giang hồ, -6 Uy tín CIC).',
        karmaType: 'GIANG_HO',
        cashDelta: 6_500_000,
        reputationDelta: -6,
        sanityDelta: -5,
        maiAnhDelta: -5,
        underworldDelta: 25,
        familyDebtReduction: 0,
        outcomeText:
          'Anh Long Rồng Đỏ vỗ vai khen ngợi bản lĩnh của bạn và thưởng nóng 6,5 triệu đồng!',
      },
    ],
  },
  {
    chapterNumber: 3,
    title: 'Chương 3: Chân Tướng Lão Hạc & Canh Bạc Sổ Đỏ',
    subtitle: 'Chạm trán kẻ thù của gia đình ngay giữa sới bạc phố thị',
    bannerType: 'CONFRONTATION',
    introDialogue: [
      {
        speaker: 'Lão Hạc Đỏ Đen',
        role: 'Chủ sới bạc ngầm & kẻ gài bẫy đất ở quê',
        text: 'Khà khà, hóa ra thằng con trai ông bà già dưới quê lên thành phố bươn chải là mày đấy hả? Tờ giấy thế chấp mảnh đất hương hỏa nhà mày tao đang kẹp dưới chiếu bạc đây. Có bản lĩnh thì mang tiền tươi hoặc ngồi xuống chiếu Liêng, 3 Cây nói chuyện với tao!',
      },
      {
        speaker: 'Nhân Vật Chính',
        role: 'Ánh mắt rực lửa quyết tâm',
        text: 'Ông cứ giữ kỹ tờ giấy đó đi. Tôi sẽ khiến ông phải tự tay trao trả lại mảnh đất của gia đình tôi không thiếu một tấc!',
      },
    ],
    objectivesSummary: [
      'Trả nợ quê nhà xuống còn tối đa 100.000.000 ₫ (Đã trả ít nhất 50 Triệu)',
      'Chuyển chỗ ở lên ít nhất Chung Cư Mini Có Điều Hòa (hoặc cao hơn)',
      'Đạt ít nhất 100 EXP làm việc HOẶC đã chơi 5 ván tại Chiếu Bạc',
    ],
    choices: [
      {
        id: 'ch3_phap_ly',
        label: 'Thu thập hồ sơ lừa đảo & dùng uy tín Ngân hàng ép Lão Hạc',
        description:
          'Cùng Mai Anh và luật sư ngân hàng VietBank vạch trần lãi suất khống của Lão Hạc (Ép giảm trực tiếp 25.000.000 ₫ nợ quê nhà, +15 Uy tín CIC).',
        karmaType: 'CHINH_DAO',
        cashDelta: 2_000_000,
        reputationDelta: 15,
        sanityDelta: 12,
        maiAnhDelta: 15,
        underworldDelta: 5,
        familyDebtReduction: 25_000_000,
        outcomeText:
          'Trước bằng chứng thép, Lão Hạc buộc phải gạch bỏ 25 triệu tiền lãi khống trong hợp đồng nợ đất quê nhà!',
      },
      {
        id: 'ch3_sat_phat',
        label: 'Ngồi xuống chiếu VIP đấu 3 Cây & Liêng lột sạch ví Lão Hạc',
        description:
          'Dùng bản lĩnh đỏ đen đánh gục Lão Hạc ngay tại sới của hắn (+15.000.000 ₫ tiền mặt thắng độ, giảm 15.000.000 ₫ nợ quê, +25 Độ nể giang hồ).',
        karmaType: 'GIANG_HO',
        cashDelta: 15_000_000,
        reputationDelta: 0,
        sanityDelta: 5,
        maiAnhDelta: 0,
        underworldDelta: 25,
        familyDebtReduction: 15_000_000,
        outcomeText:
          'Cả sới bạc chấn động khi bạn lật Củ Rùa A♦ và Sáp K khiến Lão Hạc tái mặt thua trắng 15 triệu!',
      },
    ],
  },
  {
    chapterNumber: 4,
    title: 'Chương 4: Giông Bão Thương Trường & Thế Lực Mới',
    subtitle: 'Đối đầu Ông Trùm Hải Phòng & khẳng định vị thế đại gia',
    bannerType: 'CONFRONTATION',
    introDialogue: [
      {
        speaker: 'Ông Trùm Hải Phòng',
        role: 'Trùm tài chính ngầm đứng sau Lão Hạc',
        text: 'Thằng em tuổi trẻ tài cao đấy! Lão Hạc đã phải nhún nhường mày, nhưng sổ đỏ gốc đang nằm trong két sắt của anh. Cho mày thời hạn cuối để gom đủ tiền tất toán và chứng minh mày thuộc tầng lớp tinh hoa của cái thành phố này!',
      },
      {
        speaker: 'Mai Anh',
        role: 'Người đồng hành tri kỷ',
        text: 'Chỉ còn một chặng đường cuối nữa thôi anh! Chúng ta đã đi từ căn phòng trọ mái tôn chật hẹp đến ngày hôm nay, nhất định sẽ lấy lại được mảnh đất cho bố mẹ!',
      },
    ],
    objectivesSummary: [
      'Sở hữu ít nhất 1 Tài sản cao cấp (Vàng SJC 9999, Xe SH 150i, Ô tô Sedan hoặc Sổ đỏ đất nền)',
      'Giảm nợ quê nhà xuống còn tối đa 40.000.000 ₫',
      'Tổng Tài Sản Ròng (Net Worth) đạt tối thiểu 100.000.000 ₫',
    ],
    choices: [
      {
        id: 'ch4_ dinh_hon',
        label: 'Đính hôn cùng Mai Anh & thành lập công ty gia đình',
        description:
          'Chính thức gắn kết cùng Mai Anh, nhận khoản vốn hồi môn và sự ủng hộ tuyệt đối (+12.000.000 ₫, +30 Tình cảm Mai Anh, +15 Uy tín CIC).',
        karmaType: 'CHINH_DAO',
        cashDelta: 12_000_000,
        reputationDelta: 15,
        sanityDelta: 25,
        maiAnhDelta: 30,
        underworldDelta: 0,
        familyDebtReduction: 10_000_000,
        outcomeText:
          'Lễ đính hôn ấm cúng diễn ra! Hai vợ chồng sẵn sàng cho ngày trở về quê hương chuộc đất vinh quy bái tổ.',
      },
      {
        id: 'ch4_thau_tom',
        label: 'Thâu tóm cổ phần sới bạc & buộc Ông Trùm Hải Phòng nhượng bộ',
        description:
          'Dùng thanh thế giang hồ ép Ông Trùm chia cổ tức sới Tài Xỉu (+22.000.000 ₫ tiền mặt, +30 Độ nể giang hồ).',
        karmaType: 'GIANG_HO',
        cashDelta: 22_000_000,
        reputationDelta: -5,
        sanityDelta: 10,
        maiAnhDelta: 0,
        underworldDelta: 30,
        familyDebtReduction: 10_000_000,
        outcomeText:
          'Ông Trùm Hải Phòng đích thân rót rượu kết nghĩa huynh đệ và cắt giảm thêm 10 triệu nợ quê cho bạn!',
      },
    ],
  },
  {
    chapterNumber: 5,
    title: 'Chương 5: Vinh Quy Bái Tổ — Đỉnh Cao Nhân Sinh',
    subtitle: 'Xóa sạch mọi món nợ, chuộc lại đất tổ và viết nên huyền thoại',
    bannerType: 'HOMETOWN',
    introDialogue: [
      {
        speaker: 'Bà Lan (Mẹ ở quê)',
        role: 'Đón con nơi cổng làng rợp bóng tre',
        text: 'Bố mày khỏi hẳn bệnh rồi con ơi! Cả làng cả tổng đang nhắc tên mày. Chỉ cần hôm nay con tất toán nốt phần nợ cuối cùng để cầm cuốn Sổ Đỏ mảnh đất tổ tiên về nhà, bố mẹ có nhắm mắt cũng mãn nguyện!',
      },
    ],
    objectivesSummary: [
      'Thanh toán sạch 100% Nợ Sổ Đỏ Quê Nhà (Nợ quê = 0 ₫)',
      'Không còn nợ Ngân hàng VietBank và không nợ Bát Họ (Tổng nợ = 0 ₫)',
      'Đạt Tổng Tài Sản Ròng (Net Worth) tối thiểu 200.000.000 ₫',
    ],
    choices: [
      {
        id: 'ch5_ending_chinh_dao',
        label: 'Đại Kết Cục Chính Đạo: Doanh Nhân Thành Đạt & Gia Đình Viên Mãn',
        description:
          'Trao lại cuốn Sổ Đỏ cho bố mẹ, xây biệt thự khang trang ở quê và sống hạnh phúc viên mãn cùng Mai Anh (+50.000.000 ₫ phần thưởng vinh danh).',
        karmaType: 'CHINH_DAO',
        cashDelta: 50_000_000,
        reputationDelta: 25,
        sanityDelta: 50,
        maiAnhDelta: 25,
        underworldDelta: 0,
        familyDebtReduction: 0,
        outcomeText:
          'CHÚC MỪNG ĐẠI KẾT CỤC: Từ hai bàn tay trắng nơi phòng trọ mái tôn, bạn đã báo hiếu cha mẹ trọn vẹn và trở thành doanh nhân mẫu mực!',
      },
      {
        id: 'ch5_ending_giang_ho',
        label: 'Đại Kết Cục Bá Chủ: Ông Trùm Phố Thị & Thần Bài Bất Bại',
        description:
          'Chuộc lại đất tổ trong đoàn xe hộ tống hùng hậu, thống lĩnh cả thương trường lẫn chiếu bạc (+65.000.000 ₫ phần thưởng bá chủ).',
        karmaType: 'GIANG_HO',
        cashDelta: 65_000_000,
        reputationDelta: 10,
        sanityDelta: 40,
        maiAnhDelta: 10,
        underworldDelta: 30,
        familyDebtReduction: 0,
        outcomeText:
          'CHÚC MỪNG ĐẠI KẾT CỤC: Tên tuổi của bạn trở thành huyền thoại khắp các khu phố và chiếu bạc Việt Nam!',
      },
    ],
  },
];

export const WIFE_CANDIDATES_DATA: WifeCandidate[] = [
  {
    id: 'mai_anh',
    name: 'Nguyễn Mai Anh',
    role: 'Cô Chủ Quán Cà Phê Vợt Đầu Ngõ',
    personality: 'Dịu dàng · Đảm đang · Chung thủy',
    description:
      'Người con gái tảo tần luôn ở bên động viên bạn từ những ngày còn ở phòng trọ mái tôn nghèo khó. Cưới Mai Anh giúp tổ ấm luôn êm ấm, tiết kiệm chi tiêu.',
    minAffectionToMarry: 70,
    minReputation: 40,
    reqHousingNonSlum: false,
    weddingCost: 15_000_000,
    dowryAndGiftRange: [10_000_000, 22_000_000],
    dailyIncomeHelp: 350_000,
    dailySanityBonus: 10,
    dailyHealthBonus: 4,
  },
  {
    id: 'thao_vy',
    name: 'Bác Sĩ Trần Thảo Vy',
    role: 'Bác Sĩ Khoa Nội Bệnh Viện Quận',
    personality: 'Tri thức · Nhân hậu · Gia giáo',
    description:
      'Quen bạn khi chăm sóc thuốc thang cho bố bạn. Một người vợ bác sĩ vừa có thu nhập ổn định vừa chăm lo sức khỏe cho cả gia đình và con cái.',
    minAffectionToMarry: 75,
    minReputation: 60,
    reqHousingNonSlum: true,
    weddingCost: 30_000_000,
    dowryAndGiftRange: [22_000_000, 42_000_000],
    dailyIncomeHelp: 650_000,
    dailySanityBonus: 8,
    dailyHealthBonus: 12,
  },
  {
    id: 'ngoc_bich',
    name: 'Tiểu Thư Lê Ngọc Bích',
    role: 'Ái Nữ Chủ Tiệm Vàng Phố Cổ',
    personality: 'Sắc sảo · Thời thượng · Giỏi buôn bán',
    description:
      'Con gái rượu của đại gia kim hoàn phố cổ. Đòi hỏi bạn phải có xe sang và vị thế, nhưng khi cưới sẽ mang về của hồi môn khủng và dòng tiền kinh doanh lớn.',
    minAffectionToMarry: 80,
    minReputation: 65,
    reqHousingNonSlum: true,
    reqAssetId: 'xe_sh',
    weddingCost: 60_000_000,
    dowryAndGiftRange: [50_000_000, 95_000_000],
    dailyIncomeHelp: 1_400_000,
    dailySanityBonus: 6,
    dailyHealthBonus: 4,
  },
];

export const LIFE_ENDINGS_DATA: LifeEnding[] = [
  {
    id: 'ending_tu_tu_no_nan',
    code: 'KẾT THÚC #01 · BI KỊCH',
    title: 'Bước Chân Tuyệt Vọng Trên Cầu Đêm Mưa',
    category: 'BI_KICH',
    subtitle: 'Quẫn bách vì nợ nặng lãi chồng chất và tinh thần suy sụp hoàn toàn',
    storyText:
      'Tiếng chuông điện thoại đòi nợ gào thét trong đêm mưa tầm tã. Lãi mẹ đẻ lãi con từ những bát họ và những canh bạc cháy túi khiến bạn không còn lối thoát. Giữa thành phố hoa lệ triệu người, bạn gục ngã trong sự tuyệt vọng cùng cực, để lại nỗi đau xé lòng cho cha mẹ già nơi quê nhà...',
    conditionHint: 'Nợ nặng lãi / Ngân hàng ngập đầu + Không còn tiền trả + Tinh thần suy sụp chọn kết liễu trên cầu',
  },
  {
    id: 'ending_tron_no_biet_xu',
    code: 'KẾT THÚC #02 · BI KỊCH',
    title: 'Đêm Vượt Biên Trốn Nợ Biệt Xứ',
    category: 'BI_KICH',
    subtitle: 'Bỏ lại quê hương và gia đình để chạy trốn giang hồ truy sát',
    storyText:
      'Khi đàn em của Anh Long Rồng Đỏ và Ông Trùm Hải Phòng vây kín ngõ trọ, bạn vội vã gom vài bộ quần áo nhảy lên chuyến xe khách đường dài lúc 2 giờ sáng. Từ đây bạn sống kiếp tha hương ẩn danh nơi đất khách, không bao giờ dám quay về nhìn mặt bố mẹ và người thương.',
    conditionHint: 'Đang mang nợ quá hạn lớn và chọn phương án Bỏ trốn biệt xứ trong đêm',
  },
  {
    id: 'ending_vong_lao_ly',
    code: 'KẾT THÚC #03 · BI KỊCH',
    title: 'Sau Song Sắt Trại Giam',
    category: 'BI_KICH',
    subtitle: 'Đánh đổi tự do vì làm liều trong cơn túng quẫn',
    storyText:
      'Vì muốn xóa nhanh khoản nợ khổng lồ và đổi đời trong chớp mắt, bạn đã nhắm mắt ký vào phi vụ vận chuyển hàng cấm và cầm cái sới bạc ngầm cho Ông Trùm. Khi tiếng còi xe cảnh sát hú vang giữa đêm, đôi tay bạn tra vào còng số 8, khép lại tuổi trẻ nơi buồng giam lạnh lẽo.',
    conditionHint: 'Làm liều nhận phi vụ phi pháp rủi ro cao khi đang túng quẫn nợ nần',
  },
  {
    id: 'ending_guc_nga_lao_luc',
    code: 'KẾT THÚC #04 · BI KỊCH',
    title: 'Kiệt Sức Giữa Phố Thị Hoa Lệ',
    category: 'BI_KICH',
    subtitle: 'Cạn kiệt sinh lực vì lao lực và bị giang hồ hành hung',
    storyText:
      'Những ngày dài nhịn ăn nhịn mặc cày cuốc dưới nắng gắt cùng những trận đòn dằn mặt từ chủ nợ đã vắt kiệt giọt sức lực cuối cùng của bạn. Bạn ngất lịm trên vỉa hè và phải dừng lại giấc mơ lập nghiệp dang dở.',
    conditionHint: 'Chỉ số Sức khỏe tụt về 0/100',
  },
  {
    id: 'ending_to_am_binh_yen',
    code: 'KẾT THÚC #05 · VIÊN MÃN',
    title: 'Tổ Ấm Nhỏ Hạnh Phúc Giữa Đời Thường',
    category: 'VIENMÃN' as unknown as 'VIEN_MAN',
    subtitle: 'Từ bỏ giấc mộng phù hoa để chọn cuộc sống yên bình bên vợ hiền con ngoan',
    storyText:
      'Không cần làm ông trùm hay đại gia trăm tỷ, bạn đã trả xong nợ nần, cưới được người vợ thảo hiền và đón những đứa con kháu khỉnh chào đời. Mỗi chiều tan tầm về nhà nghe tiếng cười trẻ thơ và mùi cơm canh nóng hổi, bạn nhận ra đây chính là kho báu lớn nhất của kiếp nhân sinh.',
    conditionHint: 'Đã lấy vợ, sinh con, không nợ nần và chọn nhánh An phận hạnh phúc bên gia đình',
  },
  {
    id: 'ending_than_bai_ba_chu',
    code: 'KẾT THÚC #06 · GIANG HỒ',
    title: 'Ông Trùm Chiếu Bạc & Bá Chủ Thế Giới Ngầm',
    category: 'GIANG_HO',
    subtitle: 'Thống lĩnh mọi sới 3 Cây, Liêng, Tài Xỉu và khuất phục Ông Trùm Hải Phòng',
    storyText:
      'Từ một kẻ tay trắng bước vào sới bạc, bạn đã dùng bản lĩnh tâm lý thép để lột sạch tiền của Lão Hạc và thâu tóm toàn bộ hệ thống sới ngầm phố thị. Mọi tay chơi từ Bắc chí Nam đều phải kính cẩn gọi bạn một tiếng "Đại Ca"!',
    conditionHint: 'Thắng lớn tại Chiếu Bạc, Độ nể giang hồ cao và chọn rẽ nhánh Thâu tóm thế giới ngầm',
  },
  {
    id: 'ending_doanh_nhan_chinh_dao',
    code: 'KẾT THÚC #07 · HUYỀN THOẠI',
    title: 'Vinh Quy Bái Tổ — Doanh Nhân Thành Đạt',
    category: 'HUYEN_THOAI',
    subtitle: 'Chuộc lại Sổ Đỏ đất tổ, báo hiếu cha mẹ và làm giàu chân chính',
    storyText:
      'Đoàn xe sang nối đuôi nhau tiến vào cổng làng trong tiếng trống hội rộn ràng. Bạn tự tay trao lại cuốn Sổ Đỏ mảnh đất hương hỏa cho bố mẹ, xây dựng cơ ngơi vững chắc nơi thành phố cùng người vợ hiền và những đứa con ngoan!',
    conditionHint: 'Hoàn thành Chương 5 theo con đường Chính Đạo, trả sạch nợ quê nhà và có cơ ngơi lớn',
  },
];

export const CAREER_RANKS_DATA: CareerRank[] = [
  {
    rankIndex: 0,
    title: 'Lao Động Tự Do / Thử Việc',
    minExp: 0,
    minReputation: 0,
    payMultiplier: 1.0,
    dailyBaseSalary: 0,
    perkText: 'Mức thu nhập cơ bản theo từng ca làm việc.',
  },
  {
    rankIndex: 1,
    title: 'Nhân Viên Chính Thức Lành Nghề',
    minExp: 45,
    minReputation: 50,
    payMultiplier: 1.35,
    dailyBaseSalary: 120_000,
    perkText: 'Tăng +35% thu nhập mọi ca làm việc · Phụ cấp chuyên cần +120.000 ₫/ngày.',
  },
  {
    rankIndex: 2,
    title: 'Tổ Trưởng / Trưởng Nhóm Điều Phối',
    minExp: 120,
    minReputation: 60,
    reqCourseId: 'bang_lai_b2',
    payMultiplier: 1.8,
    dailyBaseSalary: 350_000,
    perkText: 'Tăng +80% thu nhập ca · Lương cứng quản lý +350.000 ₫/ngày.',
  },
  {
    rankIndex: 3,
    title: 'Trưởng Phòng Kinh Doanh Khu Vực',
    minExp: 260,
    minReputation: 72,
    reqCourseId: 'quan_tri_kinh_doanh',
    payMultiplier: 2.5,
    dailyBaseSalary: 850_000,
    perkText: 'Tăng +150% thu nhập ca · Lương cứng Trưởng phòng +850.000 ₫/ngày.',
  },
  {
    rankIndex: 4,
    title: 'Giám Đốc Điều Hành (CEO)',
    minExp: 480,
    minReputation: 85,
    reqCourseId: 'chung_chi_bds_tai_chinh',
    payMultiplier: 3.6,
    dailyBaseSalary: 2_200_000,
    perkText: 'Đỉnh cao sự nghiệp: x3.6 thu nhập ca · Lương cứng CEO +2.200.000 ₫/ngày.',
  },
];

export const TRAINING_COURSES_DATA: TrainingCourse[] = [
  {
    id: 'bang_lai_b2',
    name: 'Thi Bằng Lái B2 & Nghiệp Vụ Điều Phối',
    institution: 'Trung Tâm Sát Hạch Lái Xe Thành Phố',
    cost: 3_500_000,
    energyCost: 25,
    expBonus: 50,
    reputationBonus: 6,
    description: 'Mở điều kiện thăng chức Tổ Trưởng, tăng mạnh kinh nghiệm nghề nghiệp thực tế.',
  },
  {
    id: 'quan_tri_kinh_doanh',
    name: 'Khóa Quản Trị Kinh Doanh & Marketing Thực Chiến',
    institution: 'Học Viện Doanh Nhân Sài Gòn - Hà Nội',
    cost: 9_000_000,
    energyCost: 30,
    expBonus: 120,
    reputationBonus: 12,
    description: 'Điều kiện cần để xét duyệt lên Trưởng Phòng Kinh Doanh Khu Vực.',
  },
  {
    id: 'chung_chi_bds_tai_chinh',
    name: 'Chứng Chỉ Hành Nghề Môi Giới BĐS & Đầu Tư Tài Chính',
    institution: 'Hiệp Hội Bất Động Sản & Chứng Khoán VN',
    cost: 20_000_000,
    energyCost: 35,
    expBonus: 240,
    reputationBonus: 18,
    description: 'Bằng cấp cao cấp nhất để bước lên vị trí Giám Đốc Điều Hành (CEO).',
  },
];

export const INVESTMENT_CHANNELS_DATA: InvestmentChannel[] = [
  {
    id: 'vn30_etf',
    code: 'VN30-INDEX',
    name: 'Cổ Phiếu Bluechip Rổ VN30 (FPT, VNM, VIC)',
    category: 'Chứng Khoán',
    baseUnitPrice: 1_000_000,
    minVolatility: -0.05,
    maxVolatility: 0.065,
    dailyDividendRate: 0.012,
    riskLabel: 'An Toàn · Cổ tức +1.2%/ngày',
    description: 'Đầu tư cổ phiếu các tập đoàn đầu ngành Việt Nam, biến động ổn định và nhận cổ tức đều đặn.',
  },
  {
    id: 'vang_nhan_9999',
    code: 'SJC-9999',
    name: 'Chỉ Vàng Nhẫn Tròn Trơn 9999',
    category: 'Vàng & Kim Khí',
    baseUnitPrice: 8_500_000,
    minVolatility: -0.025,
    maxVolatility: 0.045,
    dailyDividendRate: 0.005,
    riskLabel: 'Trú Ẩn Vốn · Giữ giá tốt',
    description: 'Kênh tích sản truyền thống của người Việt, chống trượt giá và dễ thanh khoản bất cứ lúc nào.',
  },
  {
    id: 'chuoi_ca_phe',
    code: 'CAFE-FRAN',
    name: 'Cổ Phần Chuỗi Cà Phê & Trà Đá Nhượng Quyền',
    category: 'Kinh Doanh Nhượng Quyền',
    baseUnitPrice: 15_000_000,
    minVolatility: -0.02,
    maxVolatility: 0.03,
    dailyDividendRate: 0.032,
    riskLabel: 'Dòng Tiền Thực · Lợi tức +3.2%/ngày',
    description: 'Góp vốn mở chuỗi ki-ốt cà phê mang đi khắp các quận, chia lợi nhuận tiền mặt cao mỗi ngày.',
  },
  {
    id: 'bds_vung_ven',
    code: 'LAND-SHARE',
    name: 'Suất Đầu Tư Đất Nền Đón Sóng Quy Hoạch',
    category: 'Bất Động Sản Số',
    baseUnitPrice: 30_000_000,
    minVolatility: -0.04,
    maxVolatility: 0.09,
    dailyDividendRate: 0.02,
    riskLabel: 'Tăng Trưởng Mạnh · Lợi tức +2.0%/ngày',
    description: 'Mua chung lô đất mặt tiền đón sóng mở đường vành đai, cơ hội nhân tài sản khi sốt đất.',
  },
  {
    id: 'crypto_future',
    code: 'CRYPTO-VN',
    name: 'Tài Sản Số & Tiền Mã Hóa Biến Động Mạnh',
    category: 'Tiền Số',
    baseUnitPrice: 5_000_000,
    minVolatility: -0.18,
    maxVolatility: 0.24,
    dailyDividendRate: 0,
    riskLabel: 'Rủi Ro Cao · Biên độ -18% đến +24%',
    description: 'Thị trường nhảy múa theo thời gian thực, có thể giúp nhân đôi vốn nhanh hoặc bốc hơi nếu đu đỉnh.',
  },
];



