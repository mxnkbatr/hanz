/**
 * The academy's Chinese universities (A–Z) with facts from Wikidata and photos
 * from Wikimedia Commons (free licences only; author + licence kept for the
 * credit line). Gathered 2026-10-29; scripts in the session scratchpad.
 * Hunan University (976, Yuelu Academy) and schools without a Wikidata
 * founding year show no year.
 */
export type UniversityPhoto = {
  src: string;
  author: string;
  license: string;
  licenseUrl: string | null;
  page: string;
};

export type University = {
  slug: string;
  name: string;
  /** Chinese name, as on Wikidata. */
  zh: string | null;
  /** Key into CITY_LABELS (English city name). */
  city: string | null;
  founded: number | null;
  website: string | null;
  wikidata: string | null;
  photo: UniversityPhoto | null;
};

export const universities: University[] = [
  {
    "slug": "anhui-jianzhu-university",
    "name": "Anhui Jianzhu University",
    "zh": "安徽建筑大学",
    "city": "Hefei",
    "founded": 1958,
    "website": "http://www.ahjzu.edu.cn/",
    "wikidata": "Q10946795",
    "photo": null
  },
  {
    "slug": "anhui-normal-university",
    "name": "Anhui Normal University",
    "zh": "安徽师范大学",
    "city": "Wuhu",
    "founded": 1972,
    "website": "http://www.ahnu.edu.cn",
    "wikidata": "Q614203",
    "photo": {
      "src": "/images/unis/anhui-normal-university.webp",
      "author": "Warren Leywon",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Gate_of_AHNU.jpg"
    }
  },
  {
    "slug": "beihang-university",
    "name": "Beihang University",
    "zh": "北京航空航天大学",
    "city": "Beijing",
    "founded": 1952,
    "website": "https://buaa.edu.cn",
    "wikidata": "Q2299797",
    "photo": null
  },
  {
    "slug": "beihua-university",
    "name": "Beihua University",
    "zh": "北华大学",
    "city": "Jilin City",
    "founded": 1906,
    "website": "http://en.beihua.edu.cn",
    "wikidata": "Q10902560",
    "photo": null
  },
  {
    "slug": "beijing-forestry-university",
    "name": "Beijing Forestry University",
    "zh": "北京林业大学",
    "city": "Beijing",
    "founded": 1952,
    "website": "http://www.bjfu.edu.cn/",
    "wikidata": "Q4881133",
    "photo": {
      "src": "/images/unis/beijing-forestry-university.webp",
      "author": "Shihao Sun",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Beijing_Forestry_University_(53670020).jpeg"
    }
  },
  {
    "slug": "beijing-institute-of-technology",
    "name": "Beijing Institute of Technology",
    "zh": "北京理工大学",
    "city": "Beijing",
    "founded": 1940,
    "website": "http://www.bit.edu.cn/",
    "wikidata": "Q23101",
    "photo": {
      "src": "/images/unis/beijing-institute-of-technology.webp",
      "author": "N509FZ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Main_gate_of_Beijing_Institute_of_Technology_main_campus_(20210523072112).jpg"
    }
  },
  {
    "slug": "beijing-language-and-culture-university",
    "name": "Beijing Language and Culture University",
    "zh": "北京语言大学",
    "city": "Beijing",
    "founded": 1962,
    "website": "http://www.blcu.edu.cn",
    "wikidata": "Q549697",
    "photo": {
      "src": "/images/unis/beijing-language-and-culture-university.webp",
      "author": "N509FZ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:South_gate_of_BLCU_(20230206132105).jpg"
    }
  },
  {
    "slug": "beijing-normal-university",
    "name": "Beijing Normal University",
    "zh": "北京师范大学",
    "city": "Beijing",
    "founded": 1902,
    "website": "http://www.bnu.edu.cn/",
    "wikidata": "Q1604022",
    "photo": {
      "src": "/images/unis/beijing-normal-university.webp",
      "author": "Flsxx",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
      "page": "https://commons.wikimedia.org/wiki/File:BNU_Gate.jpg"
    }
  },
  {
    "slug": "beijing-university-of-chemical-technology",
    "name": "Beijing University of Chemical Technology",
    "zh": "北京化工大学",
    "city": "Beijing",
    "founded": 1958,
    "website": "http://www.buct.edu.cn/",
    "wikidata": "Q2496210",
    "photo": {
      "src": "/images/unis/beijing-university-of-chemical-technology.webp",
      "author": "N509FZ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Beijing_University_of_Chemical_Technology_(20240125140308).jpg"
    }
  },
  {
    "slug": "beijing-university-of-posts-and-telecommunications",
    "name": "Beijing University of Posts and Telecommunications",
    "zh": "北京邮电大学",
    "city": "Beijing",
    "founded": 1955,
    "website": "http://www.bupt.edu.cn/",
    "wikidata": "Q4881210",
    "photo": {
      "src": "/images/unis/beijing-university-of-posts-and-telecommunications.webp",
      "author": "N509FZ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:West_gate_of_BUPT_(20250305153111).jpg"
    }
  },
  {
    "slug": "belt-and-road-school",
    "name": "Belt and Road School",
    "zh": null,
    "city": null,
    "founded": null,
    "website": null,
    "wikidata": null,
    "photo": null
  },
  {
    "slug": "capital-university-of-economics-and-business",
    "name": "Capital University of Economics and Business",
    "zh": "首都经济贸易大学",
    "city": "Beijing",
    "founded": 1956,
    "website": "http://www.cueb.edu.cn/",
    "wikidata": "Q1589630",
    "photo": {
      "src": "/images/unis/capital-university-of-economics-and-business.webp",
      "author": "颜邯",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:%E9%A6%96%E9%83%BD%E7%BB%8F%E6%B5%8E%E8%B4%B8%E6%98%93%E5%A4%A7%E5%AD%A6%E6%AD%A3%E9%97%A8_Front_Gate_of_Capital_University_of_Economics_and_Business,_Mar_2018.jpg"
    }
  },
  {
    "slug": "changsha-university-of-science-and-technology",
    "name": "Changsha University of Science and Technology",
    "zh": "长沙理工大学",
    "city": "Changsha",
    "founded": 1956,
    "website": "http://www.csust.edu.cn/",
    "wikidata": "Q5072117",
    "photo": null
  },
  {
    "slug": "chongqing-university",
    "name": "Chongqing University",
    "zh": "重庆大学",
    "city": "Chongqing",
    "founded": 1929,
    "website": "https://www.cqu.edu.cn",
    "wikidata": "Q834857",
    "photo": {
      "src": "/images/unis/chongqing-university.webp",
      "author": "Zhou Guanhuai",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Chongqing_University_Main_Entrance.jpg"
    }
  },
  {
    "slug": "dalian-university",
    "name": "Dalian University",
    "zh": "大连大学",
    "city": "Dalian",
    "founded": 1987,
    "website": "http://www.dlu.edu.cn/",
    "wikidata": "Q987022",
    "photo": {
      "src": "/images/unis/dalian-university.webp",
      "author": "Yoshi Canopus",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Dalian_University,_China.jpg"
    }
  },
  {
    "slug": "dalian-university-of-foreign-languages",
    "name": "Dalian University of Foreign Languages",
    "zh": "大连外国语大学",
    "city": "Dalian",
    "founded": 1964,
    "website": "https://www.dlufl.edu.cn",
    "wikidata": "Q1027478",
    "photo": {
      "src": "/images/unis/dalian-university-of-foreign-languages.webp",
      "author": "Wayne lord",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Dlufl_library.jpg"
    }
  },
  {
    "slug": "dalian-university-of-technology",
    "name": "Dalian University of Technology",
    "zh": "大连理工大学",
    "city": "Dalian",
    "founded": 1949,
    "website": "http://www.dlut.edu.cn",
    "wikidata": "Q1477368",
    "photo": null
  },
  {
    "slug": "donghua-university",
    "name": "Donghua University",
    "zh": "东华大学",
    "city": "Shanghai",
    "founded": 1951,
    "website": "http://www.dhu.edu.cn/",
    "wikidata": "Q837544",
    "photo": {
      "src": "/images/unis/donghua-university.webp",
      "author": "Njzjz",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Jingyue_Lake_at_Songjiang_Campus_of_Donghua_University.jpg"
    }
  },
  {
    "slug": "east-china-normal-university",
    "name": "East China Normal University",
    "zh": "华东师范大学",
    "city": "Shanghai",
    "founded": 1951,
    "website": "http://english.ecnu.edu.cn",
    "wikidata": "Q2034790",
    "photo": {
      "src": "/images/unis/east-china-normal-university.webp",
      "author": "Baidutieba985",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:%E5%8D%8E%E4%B8%9C%E5%B8%88%E8%8C%83%E5%A4%A7%E5%AD%A6%E6%80%9D%E7%BE%A4%E5%A0%82.jpg"
    }
  },
  {
    "slug": "fudan-university",
    "name": "Fudan University",
    "zh": "复旦大学",
    "city": "Shanghai",
    "founded": 1905,
    "website": "https://www.fudan.edu.cn",
    "wikidata": "Q495015",
    "photo": {
      "src": "/images/unis/fudan-university.webp",
      "author": "Andrew Lih",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
      "page": "https://commons.wikimedia.org/wiki/File:Fudan_university.jpg"
    }
  },
  {
    "slug": "guangdong-ocean-university",
    "name": "Guangdong Ocean University",
    "zh": "广东海洋大学",
    "city": "Zhanjiang",
    "founded": 1997,
    "website": "https://www.gdou.edu.cn",
    "wikidata": "Q5613641",
    "photo": {
      "src": "/images/unis/guangdong-ocean-university.webp",
      "author": "User:Vmenkov",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Guangdong_Ocean_University_-_P1580822.JPG"
    }
  },
  {
    "slug": "guangxi-medical-university",
    "name": "Guangxi Medical University",
    "zh": "广西医科大学",
    "city": "Nanning",
    "founded": 1934,
    "website": "http://www.gxmu.edu.cn/",
    "wikidata": "Q5613690",
    "photo": null
  },
  {
    "slug": "guangxi-normal-university",
    "name": "Guangxi Normal University",
    "zh": "广西师范大学",
    "city": "Guilin",
    "founded": 1932,
    "website": "http://www.gxnu.edu.cn/",
    "wikidata": "Q137006",
    "photo": {
      "src": "/images/unis/guangxi-normal-university.webp",
      "author": "Farm",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Guangxi_Normal_University_House.jpg"
    }
  },
  {
    "slug": "guizhou-normal-university",
    "name": "Guizhou Normal University",
    "zh": "贵州师范大学",
    "city": "Guiyang",
    "founded": 1941,
    "website": "http://www.gznu.edu.cn",
    "wikidata": "Q5616948",
    "photo": null
  },
  {
    "slug": "hainan-university",
    "name": "Hainan University",
    "zh": "海南大学",
    "city": "Haikou",
    "founded": 1983,
    "website": "http://www.hainu.edu.cn/",
    "wikidata": "Q5639382",
    "photo": null
  },
  {
    "slug": "hangzhou-dianzi-university",
    "name": "Hangzhou Dianzi University",
    "zh": "杭州电子科技大学",
    "city": "Hangzhou",
    "founded": 1956,
    "website": "https://www.hdu.edu.cn/",
    "wikidata": "Q11102606",
    "photo": null
  },
  {
    "slug": "harbin-institute-of-technology",
    "name": "Harbin Institute of Technology",
    "zh": "哈尔滨工业大学",
    "city": "Harbin",
    "founded": 1920,
    "website": "http://www.hit.edu.cn/",
    "wikidata": "Q632558",
    "photo": {
      "src": "/images/unis/harbin-institute-of-technology.webp",
      "author": "Yoshi Canopus",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Harbin_Institute_of_Technology_-_Main_Bldg.jpg"
    }
  },
  {
    "slug": "harbin-international-school",
    "name": "Harbin International School",
    "zh": null,
    "city": "Harbin",
    "founded": null,
    "website": null,
    "wikidata": null,
    "photo": null
  },
  {
    "slug": "harbin-normal-university",
    "name": "Harbin Normal University",
    "zh": "哈尔滨师范大学",
    "city": "Harbin",
    "founded": 1951,
    "website": "http://www.hrbnu.edu.cn",
    "wikidata": "Q5654434",
    "photo": {
      "src": "/images/unis/harbin-normal-university.webp",
      "author": "Prince Roy from Washington, DC",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "page": "https://commons.wikimedia.org/wiki/File:HarbinNormalUniversityGate.jpg"
    }
  },
  {
    "slug": "hebei-normal-university",
    "name": "Hebei Normal University",
    "zh": "河北师范大学",
    "city": "Shijiazhuang",
    "founded": 1902,
    "website": "http://www.hebtu.edu.cn/",
    "wikidata": "Q11141318",
    "photo": {
      "src": "/images/unis/hebei-normal-university.webp",
      "author": "N509FZ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:East_gate_of_Hebei_Normal_University,_Yuhua_Campus_(20260412105735).jpg"
    }
  },
  {
    "slug": "heilongjiang-university",
    "name": "Heilongjiang University",
    "zh": "黑龙江大学",
    "city": "Harbin",
    "founded": 1941,
    "website": "http://www.hlju.edu.cn/",
    "wikidata": "Q1058956",
    "photo": {
      "src": "/images/unis/heilongjiang-university.webp",
      "author": "Slb nsk",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Heilongjiang_University.jpg"
    }
  },
  {
    "slug": "henan-university",
    "name": "Henan University",
    "zh": "河南大学",
    "city": "Kaifeng",
    "founded": 1912,
    "website": "http://www.henu.edu.cn",
    "wikidata": "Q391150",
    "photo": {
      "src": "/images/unis/henan-university.webp",
      "author": "ScareCriterion12",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:%E6%B2%B3%E5%8D%97%E5%A4%A7%E5%AD%A6%E7%A4%BC%E5%A0%822020.jpg"
    }
  },
  {
    "slug": "hohai-university",
    "name": "Hohai University",
    "zh": "河海大学",
    "city": "Nanjing",
    "founded": 1915,
    "website": "http://www.hhu.edu.cn/",
    "wikidata": "Q662131",
    "photo": {
      "src": "/images/unis/hohai-university.webp",
      "author": "FukaiNashi",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:A_place_in_HU.jpg"
    }
  },
  {
    "slug": "hunan-university",
    "name": "Hunan University",
    "zh": "湖南大学",
    "city": "Changsha",
    "founded": null,
    "website": "http://www.hunu.edu.cn/",
    "wikidata": "Q649868",
    "photo": {
      "src": "/images/unis/hunan-university.webp",
      "author": "Huangdan2060",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "page": "https://commons.wikimedia.org/wiki/File:Hunan_University05.jpg"
    }
  },
  {
    "slug": "inner-mongolia-university",
    "name": "Inner Mongolia University",
    "zh": "内蒙古大学",
    "city": "Hohhot",
    "founded": 1957,
    "website": "http://www.imu.edu.cn/",
    "wikidata": "Q834458",
    "photo": {
      "src": "/images/unis/inner-mongolia-university.webp",
      "author": "Suoyinbu",
      "license": "Public domain",
      "licenseUrl": null,
      "page": "https://commons.wikimedia.org/wiki/File:%E5%86%85%E8%92%99%E5%8F%A4%E5%A4%A7%E5%AD%A6%E5%8D%97%E6%A0%A1%E5%8C%BA%E4%B8%BB%E6%A5%BC.jpg"
    }
  },
  {
    "slug": "jiamusi-university",
    "name": "Jiamusi University",
    "zh": "佳木斯大学",
    "city": "Jiamusi",
    "founded": 1947,
    "website": "http://www.jmsu.org",
    "wikidata": "Q4475835",
    "photo": null
  },
  {
    "slug": "jiangsu-university",
    "name": "Jiangsu University",
    "zh": "江苏大学",
    "city": "Zhenjiang",
    "founded": 1902,
    "website": "http://www.ujs.edu.cn",
    "wikidata": "Q6191740",
    "photo": {
      "src": "/images/unis/jiangsu-university.webp",
      "author": "猫猫的日记本",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Jiangsu_University_Mengxi_Campus_2013-04.JPG"
    }
  },
  {
    "slug": "jiaxing-university",
    "name": "Jiaxing University",
    "zh": "嘉兴大学",
    "city": "Jiaxing",
    "founded": null,
    "website": "http://www.zjxu.edu.cn/English/y1.aspx",
    "wikidata": "Q10923945",
    "photo": null
  },
  {
    "slug": "jilin-university",
    "name": "Jilin University",
    "zh": "吉林大学",
    "city": "Changchun",
    "founded": 1946,
    "website": "http://www.jlu.edu.cn/",
    "wikidata": "Q1432030",
    "photo": null
  },
  {
    "slug": "jinan-university",
    "name": "Jinan University",
    "zh": "暨南大学",
    "city": "Guangzhou",
    "founded": 1906,
    "website": "http://www.jnu.edu.cn/",
    "wikidata": "Q2687517",
    "photo": {
      "src": "/images/unis/jinan-university.webp",
      "author": "Onteien",
      "license": "Public domain",
      "licenseUrl": null,
      "page": "https://commons.wikimedia.org/wiki/File:Jnu_gate.jpg"
    }
  },
  {
    "slug": "lanzhou-jiaotong-university",
    "name": "Lanzhou Jiaotong University",
    "zh": "兰州交通大学",
    "city": "Lanzhou",
    "founded": 1958,
    "website": "http://www.lzjtu.cn/",
    "wikidata": "Q10893606",
    "photo": null
  },
  {
    "slug": "lanzhou-university",
    "name": "Lanzhou University",
    "zh": "兰州大学",
    "city": "Lanzhou",
    "founded": 1909,
    "website": "http://www.lzu.edu.cn/",
    "wikidata": "Q4475799",
    "photo": null
  },
  {
    "slug": "lanzhou-university-of-technology",
    "name": "Lanzhou University of Technology",
    "zh": "兰州理工大学",
    "city": "Lanzhou",
    "founded": 1919,
    "website": "http://www.lut.edu.cn/",
    "wikidata": "Q6487721",
    "photo": {
      "src": "/images/unis/lanzhou-university-of-technology.webp",
      "author": "Msood",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Lanzhou_University_of_Technology.jpg"
    }
  },
  {
    "slug": "liaoning-petrochemical-university",
    "name": "Liaoning Petrochemical University",
    "zh": "辽宁石油化工大学",
    "city": "Fushun",
    "founded": 1950,
    "website": "http://www.lnpu.edu.cn/",
    "wikidata": "Q6540153",
    "photo": null
  },
  {
    "slug": "minzu-university",
    "name": "Minzu University",
    "zh": "中央民族大学",
    "city": "Beijing",
    "founded": 1951,
    "website": "https://www.muc.edu.cn/",
    "wikidata": "Q190336",
    "photo": {
      "src": "/images/unis/minzu-university.webp",
      "author": "N509FZ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Minzu_University_of_China_(20170330115818).jpg"
    }
  },
  {
    "slug": "nanchang-medical-college",
    "name": "Nanchang Medical College",
    "zh": "南昌医学院",
    "city": "Nanchang",
    "founded": null,
    "website": "http://www.ncmc.edu.cn/",
    "wikidata": "Q109413364",
    "photo": null
  },
  {
    "slug": "nanchang-university",
    "name": "Nanchang University",
    "zh": "南昌大学",
    "city": "Nanchang",
    "founded": 1921,
    "website": "http://www.ncu.edu.cn/",
    "wikidata": "Q3497259",
    "photo": null
  },
  {
    "slug": "nanjing-university",
    "name": "Nanjing University",
    "zh": "南京大学",
    "city": "Nanjing",
    "founded": 1915,
    "website": "https://www.nju.edu.cn/main.htm",
    "wikidata": "Q683580",
    "photo": {
      "src": "/images/unis/nanjing-university.webp",
      "author": "猫猫的日记本",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Main_Gate_of_Nanjing_University_Gulou_Campus_2012-11.JPG"
    }
  },
  {
    "slug": "nanjing-university-of-aeronautics-and-astronautics",
    "name": "Nanjing University of Aeronautics and Astronautics",
    "zh": "南京航空航天大学",
    "city": "Nanjing",
    "founded": 1952,
    "website": "http://www.nuaa.edu.cn",
    "wikidata": "Q23110",
    "photo": {
      "src": "/images/unis/nanjing-university-of-aeronautics-and-astronautics.webp",
      "author": "Zhou Guanhuai",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Ming_Palace_Campus_of_Nanjing_University_of_Aeronautics_and_Astronautics.jpg"
    }
  },
  {
    "slug": "ningbo-university",
    "name": "Ningbo University",
    "zh": "宁波大学",
    "city": "Ningbo",
    "founded": 1986,
    "website": "https://www.nbu.edu.cn",
    "wikidata": "Q4391363",
    "photo": null
  },
  {
    "slug": "northeast-normal-university",
    "name": "Northeast Normal University",
    "zh": "东北师范大学",
    "city": "Changchun",
    "founded": 1946,
    "website": "http://en.nenu.edu.cn/",
    "wikidata": "Q4393424",
    "photo": {
      "src": "/images/unis/northeast-normal-university.webp",
      "author": "Rolfmueller",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Northeast_normal_university_old_campus_entrance_2011_07_22.jpg"
    }
  },
  {
    "slug": "northwestern-polytechnical-university",
    "name": "Northwestern Polytechnical University",
    "zh": "西北工业大学",
    "city": "Xi’an",
    "founded": 1938,
    "website": "http://www.nwpu.edu.cn/",
    "wikidata": "Q832550",
    "photo": {
      "src": "/images/unis/northwestern-polytechnical-university.webp",
      "author": "星巴克女王",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Northwestern_Polytechnical_University_3.jpg"
    }
  },
  {
    "slug": "peking-university",
    "name": "Peking University",
    "zh": "北京大学",
    "city": "Beijing",
    "founded": 1898,
    "website": "https://pku.edu.cn",
    "wikidata": "Q16952",
    "photo": {
      "src": "/images/unis/peking-university.webp",
      "author": "galaygobi",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "page": "https://commons.wikimedia.org/wiki/File:PekingUniversityPic6.jpg"
    }
  },
  {
    "slug": "qingdao-university",
    "name": "Qingdao University",
    "zh": "青岛大学",
    "city": "Qingdao",
    "founded": 1985,
    "website": "http://www.qdu.edu.cn/",
    "wikidata": "Q82267",
    "photo": {
      "src": "/images/unis/qingdao-university.webp",
      "author": "M. Weitzel",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5",
      "page": "https://commons.wikimedia.org/wiki/File:Qingdao_University.jpg"
    }
  },
  {
    "slug": "qufu-normal-university",
    "name": "Qufu Normal University",
    "zh": "曲阜师范大学",
    "city": "Qufu",
    "founded": 1955,
    "website": "http://www.qfnu.edu.cn",
    "wikidata": "Q3332415",
    "photo": {
      "src": "/images/unis/qufu-normal-university.webp",
      "author": "Kungfumastor",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "page": "https://commons.wikimedia.org/wiki/File:%E6%9B%B2%E9%98%9C%E5%B8%88%E8%8C%83%E5%A4%A7%E5%AD%A6%E6%A0%A1%E9%97%A8.jpg"
    }
  },
  {
    "slug": "renmin-university",
    "name": "Renmin University",
    "zh": "中国人民大学",
    "city": "Beijing",
    "founded": 1937,
    "website": "https://www.ruc.edu.cn/",
    "wikidata": "Q1074117",
    "photo": {
      "src": "/images/unis/renmin-university.webp",
      "author": "chenyingphoto",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "page": "https://commons.wikimedia.org/wiki/File:RenminUniversitypic1.jpg"
    }
  },
  {
    "slug": "shandong-university",
    "name": "Shandong University",
    "zh": "山东大学",
    "city": "Jinan",
    "founded": 1901,
    "website": "https://www.sdu.edu.cn/",
    "wikidata": "Q604470",
    "photo": {
      "src": "/images/unis/shandong-university.webp",
      "author": "猫猫的日记本",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Qianfoshan_Campus_of_Shandong_University_2010-03.JPG"
    }
  },
  {
    "slug": "shanghai-jiao-tong-university",
    "name": "Shanghai Jiao Tong University",
    "zh": "上海交通大学",
    "city": "Shanghai",
    "founded": 1896,
    "website": "https://www.sjtu.edu.cn/",
    "wikidata": "Q525169",
    "photo": {
      "src": "/images/unis/shanghai-jiao-tong-university.webp",
      "author": "This illustration was made by Peter Potrowl. Please credit this with : © Peter Potrowl in the immediate vicinity of the ",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Shanghai_Jiao_Tong_University_1.jpg"
    }
  },
  {
    "slug": "shanghai-ocean-university",
    "name": "Shanghai Ocean University",
    "zh": "上海海洋大学",
    "city": "Shanghai",
    "founded": 1912,
    "website": "http://www.shou.edu.cn",
    "wikidata": "Q7488485",
    "photo": {
      "src": "/images/unis/shanghai-ocean-university.webp",
      "author": "BLKCRAYON",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Library_Building_on_Lingang_Campus_of_Shanghai_Ocean_University.jpg"
    }
  },
  {
    "slug": "shanghai-university",
    "name": "Shanghai University",
    "zh": "上海大学",
    "city": "Shanghai",
    "founded": 1994,
    "website": "http://www.shu.edu.cn",
    "wikidata": "Q1343386",
    "photo": {
      "src": "/images/unis/shanghai-university.webp",
      "author": "YULIN Peng",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
      "page": "https://commons.wikimedia.org/wiki/File:SHU_library_in_Baoshan.jpg"
    }
  },
  {
    "slug": "shantou-university",
    "name": "Shantou University",
    "zh": "汕头大学",
    "city": "Shantou",
    "founded": 1981,
    "website": "http://www.stu.edu.cn",
    "wikidata": "Q835075",
    "photo": {
      "src": "/images/unis/shantou-university.webp",
      "author": "Ferox Seneca",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Shantou_University_Auditorium.jpg"
    }
  },
  {
    "slug": "shanxi-normal-university",
    "name": "Shanxi Normal University",
    "zh": "山西师范大学",
    "city": "Taiyuan",
    "founded": 1958,
    "website": "http://www.sxnu.edu.cn/",
    "wikidata": "Q7489125",
    "photo": {
      "src": "/images/unis/shanxi-normal-university.webp",
      "author": "N509FZ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:East_gate_of_Shanxi_Normal_University_Taiyuan_Campus,_south_wing_(20241104102554).jpg"
    }
  },
  {
    "slug": "shenyang-normal-university",
    "name": "Shenyang Normal University",
    "zh": "沈阳师範大学",
    "city": "Shenyang",
    "founded": 1951,
    "website": "http://www.synu.edu.cn/",
    "wikidata": "Q7494353",
    "photo": null
  },
  {
    "slug": "shenzhen-university",
    "name": "Shenzhen University",
    "zh": "深圳大学",
    "city": "Shenzhen",
    "founded": 1983,
    "website": "https://www.szu.edu.cn",
    "wikidata": "Q1945756",
    "photo": {
      "src": "/images/unis/shenzhen-university.webp",
      "author": "NAN LIU",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "page": "https://commons.wikimedia.org/wiki/File:Building_of_Humanities_Yuehai_Campus,_Shenzhen_University.jpg"
    }
  },
  {
    "slug": "sichuan-university",
    "name": "Sichuan University",
    "zh": "四川大学",
    "city": "Chengdu",
    "founded": 1896,
    "website": "https://scu.edu.cn",
    "wikidata": "Q2281517",
    "photo": {
      "src": "/images/unis/sichuan-university.webp",
      "author": "User zh:User:本本一世 on zh.wikipedia",
      "license": "Public domain",
      "licenseUrl": null,
      "page": "https://commons.wikimedia.org/wiki/File:Scuhuaxi.jpg"
    }
  },
  {
    "slug": "sichuan-vocational-college-of-cultural-industries",
    "name": "Sichuan Vocational College of Cultural Industries",
    "zh": "四川文化产业职业学院",
    "city": "Chengdu",
    "founded": null,
    "website": "https://www.svcci.cn/",
    "wikidata": "Q112677167",
    "photo": null
  },
  {
    "slug": "soochow-university",
    "name": "Soochow University",
    "zh": "苏州大学",
    "city": "Suzhou",
    "founded": 1900,
    "website": "http://www.suda.edu.cn/",
    "wikidata": "Q1639978",
    "photo": {
      "src": "/images/unis/soochow-university.webp",
      "author": "song songroov",
      "license": "CC BY 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Gusu,_Suzhou,_Jiangsu,_China_-_panoramio_(223).jpg"
    }
  },
  {
    "slug": "south-china-university-of-technology",
    "name": "South China University of Technology",
    "zh": "华南理工大学",
    "city": "Guangzhou",
    "founded": 1952,
    "website": "http://www.scut.edu.cn/",
    "wikidata": "Q835366",
    "photo": {
      "src": "/images/unis/south-china-university-of-technology.webp",
      "author": "LPS.1",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "page": "https://commons.wikimedia.org/wiki/File:South_China_University_of_Technology_South_Gate.jpg"
    }
  },
  {
    "slug": "southeast-university",
    "name": "Southeast University",
    "zh": "东南大学",
    "city": "Nanjing",
    "founded": 1902,
    "website": "https://www.seu.edu.cn/",
    "wikidata": "Q3551770",
    "photo": {
      "src": "/images/unis/southeast-university.webp",
      "author": "Zhangzhugang",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Nanjing_Dongnan_Daxue_2017.11.12_11-06-36.jpg"
    }
  },
  {
    "slug": "southwest-jiaotong-university",
    "name": "Southwest Jiaotong University",
    "zh": "西南交通大学",
    "city": "Chengdu",
    "founded": 1896,
    "website": "https://www.swjtu.edu.cn",
    "wikidata": "Q3551422",
    "photo": {
      "src": "/images/unis/southwest-jiaotong-university.webp",
      "author": "Kcx36",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Southern_Gate_of_Southwest_Jiaotong_University_(the_Main_Xipu_Campus)_THE_BACK_SIDE.jpg"
    }
  },
  {
    "slug": "sun-yat-sen-university",
    "name": "Sun Yat-sen University",
    "zh": "中山大学",
    "city": "Guangzhou",
    "founded": 1924,
    "website": "http://www.sysu.edu.cn/",
    "wikidata": "Q178972",
    "photo": {
      "src": "/images/unis/sun-yat-sen-university.webp",
      "author": "created by Daniel Berthold",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
      "page": "https://commons.wikimedia.org/wiki/File:Zhongda_ZH3.jpg"
    }
  },
  {
    "slug": "taiyuan-university-of-technology",
    "name": "Taiyuan University of Technology",
    "zh": "太原理工大学",
    "city": "Taiyuan",
    "founded": 1902,
    "website": "https://www.tyut.edu.cn/",
    "wikidata": "Q7676661",
    "photo": {
      "src": "/images/unis/taiyuan-university-of-technology.webp",
      "author": "DukeAnt",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Taiyuan_University_of_Technology_Yingxi_Campus.jpg"
    }
  },
  {
    "slug": "tianjin-university",
    "name": "Tianjin University",
    "zh": "天津大学",
    "city": "Tianjin",
    "founded": 1895,
    "website": "http://www.tju.edu.cn",
    "wikidata": "Q2031560",
    "photo": {
      "src": "/images/unis/tianjin-university.webp",
      "author": "Flsxx",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
      "page": "https://commons.wikimedia.org/wiki/File:TJU_Gate.JPG"
    }
  },
  {
    "slug": "tongji-university",
    "name": "Tongji University",
    "zh": "同济大学",
    "city": "Shanghai",
    "founded": 1907,
    "website": "https://www.tongji.edu.cn/",
    "wikidata": "Q16947",
    "photo": {
      "src": "/images/unis/tongji-university.webp",
      "author": "Fayhoo",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Tongjidaxue_Tushuguan.JPG"
    }
  },
  {
    "slug": "tsinghua-shenzhen-international-graduate-school",
    "name": "Tsinghua Shenzhen International Graduate School",
    "zh": "清华大学深圳国际研究生院",
    "city": "Shenzhen",
    "founded": null,
    "website": "http://www.sigs.tsinghua.edu.cn/",
    "wikidata": "Q15908712",
    "photo": null
  },
  {
    "slug": "tsinghua-university",
    "name": "Tsinghua University",
    "zh": "清华大学",
    "city": "Beijing",
    "founded": 1911,
    "website": "https://www.tsinghua.edu.cn",
    "wikidata": "Q16955",
    "photo": {
      "src": "/images/unis/tsinghua-university.webp",
      "author": "User:Yaoleilei",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
      "page": "https://commons.wikimedia.org/wiki/File:Thu_gate.JPG"
    }
  },
  {
    "slug": "university-of-international-business-and-economics",
    "name": "University of International Business and Economics",
    "zh": "对外经济贸易大学",
    "city": "Beijing",
    "founded": 1951,
    "website": "http://www.uibe.edu.cn/",
    "wikidata": "Q835779",
    "photo": {
      "src": "/images/unis/university-of-international-business-and-economics.webp",
      "author": "N509FZ",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:South_gate_of_UIBE_(20230215153342).jpg"
    }
  },
  {
    "slug": "wenzhou-university",
    "name": "Wenzhou University",
    "zh": "温州大学",
    "city": "Wenzhou",
    "founded": 1984,
    "website": "http://www.wzu.edu.cn/",
    "wikidata": "Q7983088",
    "photo": {
      "src": "/images/unis/wenzhou-university.webp",
      "author": "Md. Ehteshamul Hafiz",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:University_town_sign.JPG"
    }
  },
  {
    "slug": "wuhan-university",
    "name": "Wuhan University",
    "zh": "武汉大学",
    "city": "Wuhan",
    "founded": 1926,
    "website": "http://www.whu.edu.cn",
    "wikidata": "Q1108197",
    "photo": {
      "src": "/images/unis/wuhan-university.webp",
      "author": "Howchou",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Whu_old_library_1.JPG"
    }
  },
  {
    "slug": "xian-jiaotong-university",
    "name": "Xi’an Jiaotong University",
    "zh": "西安交通大学",
    "city": "Xi’an",
    "founded": 1896,
    "website": "http://www.xjtu.edu.cn/",
    "wikidata": "Q981237",
    "photo": {
      "src": "/images/unis/xian-jiaotong-university.webp",
      "author": "Jucember",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:XJTU_Gate.jpg"
    }
  },
  {
    "slug": "xian-shiyou-university",
    "name": "Xi’an Shiyou University",
    "zh": "西安石油大学",
    "city": "Xi’an",
    "founded": 1951,
    "website": "https://english.xsyu.edu.cn/",
    "wikidata": "Q8044031",
    "photo": {
      "src": "/images/unis/xian-shiyou-university.webp",
      "author": "Liuxingy",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:%E8%A5%BF%E5%AE%89%E7%9F%B3%E6%B2%B9%E5%A4%A7%E5%AD%A6%E9%84%A0%E9%82%91%E6%A0%A1%E5%8C%BA%E4%B8%9C%E5%A4%A7%E9%97%A8_01.jpg"
    }
  },
  {
    "slug": "xiamen-university",
    "name": "Xiamen University",
    "zh": "厦门大学",
    "city": "Xiamen",
    "founded": 1921,
    "website": "https://www.xmu.edu.cn/",
    "wikidata": "Q1153539",
    "photo": {
      "src": "/images/unis/xiamen-university.webp",
      "author": "Ratvirgin",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Panoramatic_view_of_xiamen_university_at_sunset.jpg"
    }
  },
  {
    "slug": "xinjiang-university",
    "name": "Xinjiang University",
    "zh": "新疆大学",
    "city": "Ürümqi",
    "founded": 1924,
    "website": "https://www.xju.edu.cn",
    "wikidata": "Q985578",
    "photo": null
  },
  {
    "slug": "yangzhou-university",
    "name": "Yangzhou University",
    "zh": "扬州大学",
    "city": "Yangzhou",
    "founded": 1902,
    "website": "http://www.yzu.edu.cn",
    "wikidata": "Q8048674",
    "photo": {
      "src": "/images/unis/yangzhou-university.webp",
      "author": "Zhou Guanhuai",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Yangzhou_University.jpg"
    }
  },
  {
    "slug": "zhejiang-international-studies-university",
    "name": "Zhejiang International Studies University",
    "zh": "浙江外国语学院",
    "city": "Hangzhou",
    "founded": 1987,
    "website": "http://www.zisu.edu.cn/",
    "wikidata": "Q16259712",
    "photo": null
  },
  {
    "slug": "zhejiang-normal-university",
    "name": "Zhejiang Normal University",
    "zh": "浙江师范大学",
    "city": "Jinhua",
    "founded": 1956,
    "website": "http://zjnu.edu.cn",
    "wikidata": "Q11148738",
    "photo": {
      "src": "/images/unis/zhejiang-normal-university.webp",
      "author": "serapio",
      "license": "CC BY-SA 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "page": "https://commons.wikimedia.org/wiki/File:Zhejiang_Normal_University_(228082775).jpg"
    }
  },
  {
    "slug": "zhejiang-sci-tech-university",
    "name": "Zhejiang Sci-Tech University",
    "zh": "浙江理工大学",
    "city": "Hangzhou",
    "founded": 1897,
    "website": "http://www.zstu.edu.cn/",
    "wikidata": "Q8070672",
    "photo": {
      "src": "/images/unis/zhejiang-sci-tech-university.webp",
      "author": "Huandy618",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "page": "https://commons.wikimedia.org/wiki/File:Zhejiang_Sci-Tech_University_27.JPG"
    }
  },
  {
    "slug": "zhejiang-university-of-science-and-technology",
    "name": "Zhejiang University of Science and Technology",
    "zh": "浙江科技大学",
    "city": "Hangzhou",
    "founded": 1980,
    "website": "https://www.zust.edu.cn/",
    "wikidata": "Q1622235",
    "photo": null
  },
  {
    "slug": "zhengzhou-university",
    "name": "Zhengzhou University",
    "zh": "郑州大学",
    "city": "Zhengzhou",
    "founded": 1956,
    "website": "http://www.zzu.edu.cn",
    "wikidata": "Q649895",
    "photo": {
      "src": "/images/unis/zhengzhou-university.webp",
      "author": "ASHillocks",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "page": "https://commons.wikimedia.org/wiki/File:Administration_building_of_Zhengzhou_University.jpg"
    }
  }
];

type Lang = "mn" | "en" | "zh";
type Tri = Record<Lang, string>;

/** City names in the site's three languages. */
export const CITY_LABELS: Record<string, Tri> = {
  Beijing: { mn: "Бээжин", en: "Beijing", zh: "北京" },
  Shanghai: { mn: "Шанхай", en: "Shanghai", zh: "上海" },
  Tianjin: { mn: "Тяньжин", en: "Tianjin", zh: "天津" },
  Chongqing: { mn: "Чунцин", en: "Chongqing", zh: "重庆" },
  Nanjing: { mn: "Нанжин", en: "Nanjing", zh: "南京" },
  Hangzhou: { mn: "Ханжоу", en: "Hangzhou", zh: "杭州" },
  Guangzhou: { mn: "Гуанжоу", en: "Guangzhou", zh: "广州" },
  Shenzhen: { mn: "Шэньжэнь", en: "Shenzhen", zh: "深圳" },
  Wuhan: { mn: "Ухань", en: "Wuhan", zh: "武汉" },
  Chengdu: { mn: "Чэнду", en: "Chengdu", zh: "成都" },
  "Xi’an": { mn: "Сиань", en: "Xi’an", zh: "西安" },
  Harbin: { mn: "Харбин", en: "Harbin", zh: "哈尔滨" },
  Changchun: { mn: "Чанчунь", en: "Changchun", zh: "长春" },
  "Jilin City": { mn: "Гирин", en: "Jilin City", zh: "吉林市" },
  Dalian: { mn: "Далянь", en: "Dalian", zh: "大连" },
  Shenyang: { mn: "Шэньян", en: "Shenyang", zh: "沈阳" },
  Fushun: { mn: "Фүшүнь", en: "Fushun", zh: "抚顺" },
  Jinan: { mn: "Жинань", en: "Jinan", zh: "济南" },
  Qingdao: { mn: "Чиндао", en: "Qingdao", zh: "青岛" },
  Qufu: { mn: "Чюйфу", en: "Qufu", zh: "曲阜" },
  Zhengzhou: { mn: "Жэнжоу", en: "Zhengzhou", zh: "郑州" },
  Kaifeng: { mn: "Кайфэн", en: "Kaifeng", zh: "开封" },
  Changsha: { mn: "Чанша", en: "Changsha", zh: "长沙" },
  Nanchang: { mn: "Наньчан", en: "Nanchang", zh: "南昌" },
  Hefei: { mn: "Хэфэй", en: "Hefei", zh: "合肥" },
  Wuhu: { mn: "Ухү", en: "Wuhu", zh: "芜湖" },
  Lanzhou: { mn: "Ланьжоу", en: "Lanzhou", zh: "兰州" },
  Taiyuan: { mn: "Тайюань", en: "Taiyuan", zh: "太原" },
  Shijiazhuang: { mn: "Шижяжуан", en: "Shijiazhuang", zh: "石家庄" },
  Hohhot: { mn: "Хөх хот", en: "Hohhot", zh: "呼和浩特" },
  Ürümqi: { mn: "Үрүмч", en: "Ürümqi", zh: "乌鲁木齐" },
  Xiamen: { mn: "Сямэнь", en: "Xiamen", zh: "厦门" },
  Guilin: { mn: "Гуйлинь", en: "Guilin", zh: "桂林" },
  Nanning: { mn: "Наньнин", en: "Nanning", zh: "南宁" },
  Guiyang: { mn: "Гуйян", en: "Guiyang", zh: "贵阳" },
  Haikou: { mn: "Хайкоу", en: "Haikou", zh: "海口" },
  Zhanjiang: { mn: "Жаньжян", en: "Zhanjiang", zh: "湛江" },
  Shantou: { mn: "Шаньтоу", en: "Shantou", zh: "汕头" },
  Suzhou: { mn: "Сүжоу", en: "Suzhou", zh: "苏州" },
  Yangzhou: { mn: "Янжоу", en: "Yangzhou", zh: "扬州" },
  Zhenjiang: { mn: "Жэньжян", en: "Zhenjiang", zh: "镇江" },
  Ningbo: { mn: "Нинбо", en: "Ningbo", zh: "宁波" },
  Wenzhou: { mn: "Вэньжоу", en: "Wenzhou", zh: "温州" },
  Jinhua: { mn: "Жиньхуа", en: "Jinhua", zh: "金华" },
  Jiaxing: { mn: "Жясин", en: "Jiaxing", zh: "嘉兴" },
  Jiamusi: { mn: "Жямус", en: "Jiamusi", zh: "佳木斯" },
};

/** Kind of school, read from its English name (first match wins). */
const TYPES: [RegExp, Tri][] = [
  [/Graduate School/i, { mn: "магистр, докторын сургууль", en: "graduate school", zh: "研究生院" }],
  [/Vocational/i, { mn: "мэргэжлийн коллеж", en: "vocational college", zh: "职业学院" }],
  [/Medical/i, { mn: "анагаахын их сургууль", en: "medical university", zh: "医科院校" }],
  [/Normal/i, { mn: "багшийн их сургууль", en: "normal (teacher-training) university", zh: "师范大学" }],
  [/Foreign Languages|International Studies|Language and Culture/i, { mn: "гадаад хэлний их сургууль", en: "university of languages", zh: "外语类大学" }],
  [/Economics|Business/i, { mn: "эдийн засаг, бизнесийн их сургууль", en: "university of economics and business", zh: "财经类大学" }],
  [/Aeronautics|Beihang|Polytechnical/i, { mn: "нисэх, сансар, инженерийн их сургууль", en: "aerospace and engineering university", zh: "航空航天与工科大学" }],
  [/Jiaotong/i, { mn: "тээвэр, инженерийн их сургууль", en: "transport and engineering university", zh: "交通与工科大学" }],
  [/Posts and Telecommunications|Dianzi/i, { mn: "холбоо, электроникийн их сургууль", en: "university of telecoms and electronics", zh: "电子信息类大学" }],
  [/Chemical|Petrochemical|Shiyou/i, { mn: "хими, газрын тосны их сургууль", en: "university of chemistry and petroleum", zh: "化工与石油类大学" }],
  [/Forestry/i, { mn: "ойн аж ахуйн их сургууль", en: "forestry university", zh: "林业大学" }],
  [/Ocean/i, { mn: "далай судлалын их сургууль", en: "ocean university", zh: "海洋大学" }],
  [/Jianzhu/i, { mn: "барилга, архитектурын их сургууль", en: "university of architecture", zh: "建筑类大学" }],
  [/Minzu/i, { mn: "үндэстний их сургууль", en: "university for ethnic studies", zh: "民族大学" }],
  [/Technology|Sci-Tech|Institute/i, { mn: "технологийн их сургууль", en: "university of technology", zh: "理工类大学" }],
  [/School/i, { mn: "сургууль", en: "school", zh: "学校" }],
];
const COMPREHENSIVE: Tri = { mn: "иж бүрэн их сургууль", en: "comprehensive university", zh: "综合性大学" };

export function universityType(u: University): Tri {
  return TYPES.find(([re]) => re.test(u.name))?.[1] ?? COMPREHENSIVE;
}

export function cityLabel(u: University, lang: Lang): string {
  return u.city ? (CITY_LABELS[u.city]?.[lang] ?? u.city) : "";
}

/** One factual line from city, type and founding year. */
export function describeUniversity(u: University, lang: Lang): string {
  const type = universityType(u)[lang];
  const city = cityLabel(u, lang);
  if (lang === "zh") {
    return `${city ? `位于${city}的` : ""}${type}${u.founded ? `，创建于${u.founded}年` : ""}。`;
  }
  if (lang === "en") {
    const what = `${/^[aeiou]/i.test(type) ? "An" : "A"} ${type}`;
    return `${what}${city ? ` in ${city}` : ""}${u.founded ? `, founded in ${u.founded}` : ""}.`;
  }
  const head = city ? `${city} хотод байрлах ${type}` : type.charAt(0).toUpperCase() + type.slice(1);
  return `${head}${u.founded ? `, ${u.founded} онд байгуулагдсан` : ""}.`;
}

export const getUniversityBySlug = (slug: string) => universities.find((u) => u.slug === slug);
