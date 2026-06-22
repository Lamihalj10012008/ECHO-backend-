/**
 * Karunya Campus Building Database
 * 50+ POIs with full metadata for K-MAP Navigator
 */

const CAMPUS_BUILDINGS = [
  // ── ACADEMIC DIVISIONS ─────────────────────────────────────────────────────
  {
    id: 'bld-001',
    name: 'Division of Artificial Intelligence and Machine Learning',
    shortName: 'AI & ML Dept',
    aliases: ['ai department', 'aiml', 'machine learning', 'ai dept'],
    category: 'academic',
    subcategory: 'engineering',
    coordinates: { lat: 10.936740, lng: 76.741513 },
    floors: 3,
    departments: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning'],
    hours: { open: '08:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'moderate',
    icon: 'cpu',
    color: '#6366f1',
    description: 'Home to cutting-edge AI and ML research and undergraduate programs.',
    nearbyFacilities: ['Nescafe', 'Cake World'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['HOD Office', 'Staff Room', 'AI Lab 1', 'AI Lab 2'] },
        { level: 2, rooms: ['ML Lab', 'Deep Learning Lab', 'Server Room'] },
        { level: 3, rooms: ['Research Lab', 'Conference Room', 'Faculty Rooms'] }
      ]
    }
  },
  {
    id: 'bld-002',
    name: 'Division of Data Science and Cyber Security',
    shortName: 'Data Science Dept',
    aliases: ['data science', 'cyber security', 'dscs', 'cybersecurity'],
    category: 'academic',
    subcategory: 'engineering',
    coordinates: { lat: 10.936740, lng: 76.741513 },
    floors: 3,
    departments: ['Data Science', 'Cyber Security', 'Big Data Analytics'],
    hours: { open: '08:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'moderate',
    icon: 'shield',
    color: '#0ea5e9',
    description: 'Specializing in data analytics, cybersecurity, and forensics.',
    nearbyFacilities: ['Nescafe', 'Cake World'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['HOD Office', 'Data Lab', 'Cyber Lab 1'] },
        { level: 2, rooms: ['Analytics Lab', 'Cyber Forensics Lab'] },
        { level: 3, rooms: ['Faculty Rooms', 'Research Centre'] }
      ]
    }
  },
  {
    id: 'bld-003',
    name: 'Division of Computer Science and Engineering',
    shortName: 'CSE Dept',
    aliases: ['cse', 'computer science', 'cs department', 'cs dept'],
    category: 'academic',
    subcategory: 'engineering',
    coordinates: { lat: 10.933640, lng: 76.743235 },
    floors: 4,
    departments: ['Computer Science', 'Information Technology', 'Software Engineering'],
    hours: { open: '08:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: true, ramps: true },
    crowdLevel: 'high',
    icon: 'monitor',
    color: '#8b5cf6',
    description: 'Largest engineering division with 4 floors and multiple labs.',
    nearbyFacilities: ['Canteen', 'Emmanuel Auditorium'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['HOD Office', 'Reception', 'PC Lab 1', 'PC Lab 2'] },
        { level: 2, rooms: ['Networking Lab', 'OS Lab', 'Staff Rooms'] },
        { level: 3, rooms: ['Advanced Computing Lab', 'Seminar Hall', 'Faculty Rooms'] },
        { level: 4, rooms: ['Research Lab', 'Project Lab', 'Conference Room'] }
      ]
    }
  },
  {
    id: 'bld-004',
    name: 'Division of Electrical and Electronics Engineering',
    shortName: 'EEE Dept',
    aliases: ['eee', 'electrical', 'electronics', 'electrical engineering'],
    category: 'academic',
    subcategory: 'engineering',
    coordinates: { lat: 10.936287, lng: 76.741909 },
    floors: 3,
    departments: ['Electrical Engineering', 'Electronics Engineering', 'Power Systems'],
    hours: { open: '08:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: false, elevator: false, ramps: false },
    crowdLevel: 'moderate',
    icon: 'zap',
    color: '#f59e0b',
    description: 'Division specializing in electrical systems, power, and electronics.',
    nearbyFacilities: ['Nescafe'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['HOD Office', 'Basic Electrical Lab', 'Control Lab'] },
        { level: 2, rooms: ['Power Electronics Lab', 'Machines Lab'] },
        { level: 3, rooms: ['Faculty Rooms', 'Simulation Lab'] }
      ]
    }
  },
  {
    id: 'bld-005',
    name: 'Division of Civil Engineering',
    shortName: 'Civil Dept',
    aliases: ['civil', 'civil engineering', 'ce department'],
    category: 'academic',
    subcategory: 'engineering',
    coordinates: { lat: 10.935053, lng: 76.744117 },
    floors: 3,
    departments: ['Civil Engineering', 'Structural Engineering', 'Environmental Engineering'],
    hours: { open: '08:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'low',
    icon: 'building',
    color: '#64748b',
    description: 'Division for infrastructure design, construction, and management.',
    nearbyFacilities: ['Elohim Auditorium'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['HOD Office', 'Survey Lab', 'Materials Lab'] },
        { level: 2, rooms: ['CAD Lab', 'Structural Lab', 'Faculty Rooms'] },
        { level: 3, rooms: ['Research Room', 'Seminar Hall'] }
      ]
    }
  },
  {
    id: 'bld-006',
    name: 'Division of Aerospace Engineering',
    shortName: 'Aerospace Dept',
    aliases: ['aerospace', 'aeronautical', 'aero engineering'],
    category: 'academic',
    subcategory: 'engineering',
    coordinates: { lat: 10.934417, lng: 76.744886 },
    floors: 3,
    departments: ['Aerospace Engineering', 'Aerodynamics', 'Propulsion'],
    hours: { open: '08:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: false, elevator: false, ramps: false },
    crowdLevel: 'low',
    icon: 'plane',
    color: '#3b82f6',
    description: 'State-of-the-art aerospace engineering with wind tunnel and flight simulators.',
    nearbyFacilities: ['Emmanuel Auditorium'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['HOD Office', 'Wind Tunnel Lab', 'Design Lab'] },
        { level: 2, rooms: ['Propulsion Lab', 'Avionics Lab', 'Faculty Rooms'] },
        { level: 3, rooms: ['Research Centre', 'Model Workshop'] }
      ]
    }
  },
  {
    id: 'bld-007',
    name: 'Division of Biotechnology',
    shortName: 'Biotech Dept',
    aliases: ['biotech', 'biotechnology', 'bio technology'],
    category: 'academic',
    subcategory: 'science',
    coordinates: { lat: 10.936327, lng: 76.742572 },
    floors: 3,
    departments: ['Biotechnology', 'Bioinformatics', 'Genetic Engineering'],
    hours: { open: '08:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'low',
    icon: 'flask',
    color: '#10b981',
    description: 'Modern biotech labs with genetic sequencing and fermentation facilities.',
    nearbyFacilities: ['Cake World'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['HOD Office', 'Microbiology Lab', 'Biochemistry Lab'] },
        { level: 2, rooms: ['Genetic Lab', 'Cell Culture Lab', 'Faculty Rooms'] },
        { level: 3, rooms: ['Research Lab', 'Instrument Room'] }
      ]
    }
  },
  {
    id: 'bld-008',
    name: 'Division of Food Processing',
    shortName: 'Food Tech Dept',
    aliases: ['food processing', 'food technology', 'food tech'],
    category: 'academic',
    subcategory: 'science',
    coordinates: { lat: 10.936040, lng: 76.742566 },
    floors: 2,
    departments: ['Food Processing', 'Food Science', 'Nutrition Technology'],
    hours: { open: '08:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: false, elevator: false, ramps: false },
    crowdLevel: 'low',
    icon: 'utensils',
    color: '#f97316',
    description: 'Equipped with food processing pilot plant and quality testing labs.',
    nearbyFacilities: ['Cake World', 'Nescafe'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['HOD Office', 'Processing Lab', 'Pilot Plant'] },
        { level: 2, rooms: ['Quality Lab', 'Faculty Rooms', 'Seminar Hall'] }
      ]
    }
  },
  {
    id: 'bld-009',
    name: 'Division of Agriculture',
    shortName: 'Agriculture Dept',
    aliases: ['agriculture', 'agri', 'farming', 'agronomy'],
    category: 'academic',
    subcategory: 'science',
    coordinates: { lat: 10.934604, lng: 76.743986 },
    floors: 2,
    departments: ['Agronomy', 'Horticulture', 'Soil Science', 'Plant Pathology'],
    hours: { open: '08:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'low',
    icon: 'leaf',
    color: '#22c55e',
    description: 'Agriculture division with experimental farm plots and greenhouses.',
    nearbyFacilities: ['Rose Garden'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['HOD Office', 'Soil Lab', 'Plant Lab'] },
        { level: 2, rooms: ['Faculty Rooms', 'Greenhouse Control'] }
      ]
    }
  },

  // ── ACADEMIC — MANAGEMENT ──────────────────────────────────────────────────
  {
    id: 'bld-010',
    name: 'School of Management',
    shortName: 'Management',
    aliases: ['mba', 'management', 'business school', 'bba'],
    category: 'academic',
    subcategory: 'management',
    coordinates: { lat: 10.935500, lng: 76.743800 },
    floors: 3,
    departments: ['MBA', 'BBA', 'Finance', 'Marketing', 'HR'],
    hours: { open: '08:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'moderate',
    icon: 'briefcase',
    color: '#0891b2',
    description: 'School of Management offering MBA and BBA programs.',
    nearbyFacilities: ['Central Library', 'Canteen'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Reception', 'HOD Office', 'Case Study Room'] },
        { level: 2, rooms: ['Seminar Hall', 'Computer Lab', 'Faculty Rooms'] },
        { level: 3, rooms: ['Board Room', 'Research Library', 'Group Discussion Rooms'] }
      ]
    }
  },

  // ── LIBRARY ────────────────────────────────────────────────────────────────
  {
    id: 'bld-011',
    name: 'Central Library',
    shortName: 'Library',
    aliases: ['library', 'central library', 'lib', 'book'],
    category: 'library',
    subcategory: 'academic_support',
    coordinates: { lat: 10.935122, lng: 76.743345 },
    floors: 4,
    departments: [],
    hours: { open: '07:00', close: '21:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: true, ramps: true },
    crowdLevel: 'high',
    icon: 'book-open',
    color: '#7c3aed',
    description: 'Multi-floor central library with 100,000+ books, digital resources, and study zones.',
    nearbyFacilities: ['Placement Training Centre'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Reception', 'Issue/Return Counter', 'Reference Section', 'Newspaper Section'] },
        { level: 2, rooms: ['Engineering Books', 'Management Books', 'Reading Hall 1'] },
        { level: 3, rooms: ['Digital Library', 'e-Resources Room', 'Reading Hall 2'] },
        { level: 4, rooms: ['Research Section', 'Rare Books', 'Seminar Room', 'Terrace Study Zone'] }
      ]
    }
  },

  // ── AUDITORIUMS ────────────────────────────────────────────────────────────
  {
    id: 'bld-012',
    name: 'Emmanuel Auditorium',
    shortName: 'Emmanuel Audi',
    aliases: ['emmanuel auditorium', 'main auditorium', 'emmanuel', 'audi'],
    category: 'auditorium',
    subcategory: 'events',
    coordinates: { lat: 10.933977, lng: 76.744923 },
    floors: 2,
    departments: [],
    hours: { open: '07:00', close: '22:00', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'variable',
    icon: 'mic',
    color: '#dc2626',
    description: 'Main campus auditorium with 2000+ capacity for events, convocations, and conferences.',
    nearbyFacilities: ['Canteen', 'Aerospace Dept'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Main Hall', 'Stage', 'Green Room', 'Sound Control'] },
        { level: 2, rooms: ['Balcony Seating', 'Projection Room', 'VIP Lounge'] }
      ]
    }
  },
  {
    id: 'bld-013',
    name: 'Elohim Auditorium',
    shortName: 'Elohim Audi',
    aliases: ['elohim auditorium', 'elohim', 'second auditorium'],
    category: 'auditorium',
    subcategory: 'events',
    coordinates: { lat: 10.935226, lng: 76.745000 },
    floors: 1,
    departments: [],
    hours: { open: '07:00', close: '21:00', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'variable',
    icon: 'mic-2',
    color: '#9333ea',
    description: 'Secondary auditorium hosting seminars, workshops, and cultural events.',
    nearbyFacilities: ['Civil Dept'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Main Hall', 'Stage', 'Waiting Area', 'Control Room'] }
      ]
    }
  },
  {
    id: 'bld-014',
    name: 'El-Shaddai Auditorium',
    shortName: 'El-Shaddai Audi',
    aliases: ['el-shaddai', 'el shaddai', 'elshaddai auditorium'],
    category: 'auditorium',
    subcategory: 'events',
    coordinates: { lat: 10.937340, lng: 76.741663 },
    floors: 1,
    departments: [],
    hours: { open: '07:00', close: '21:00', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'variable',
    icon: 'music',
    color: '#e11d48',
    description: 'Elegant auditorium used for department events and cultural programs.',
    nearbyFacilities: ['Living Star Ladies Hostel'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Main Hall', 'Stage', 'Control Room'] }
      ]
    }
  },

  // ── FOOD & CAFETERIA ──────────────────────────────────────────────────────
  {
    id: 'bld-015',
    name: 'Main Canteen',
    shortName: 'Canteen',
    aliases: ['canteen', 'main canteen', 'food court', 'mess', 'dining'],
    category: 'food',
    subcategory: 'canteen',
    coordinates: { lat: 10.933689, lng: 76.743772 },
    floors: 1,
    departments: [],
    hours: { open: '07:00', close: '20:00', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'high',
    icon: 'utensils',
    color: '#f59e0b',
    description: 'Main campus canteen serving breakfast, lunch, snacks, and dinner.',
    nearbyFacilities: ['CSE Dept', 'Emmanuel Auditorium'],
    emergency: false,
    indoor: { floors: [{ level: 1, rooms: ['Dining Hall', 'Kitchen', 'Serving Counter', 'Billing Counter'] }] }
  },
  {
    id: 'bld-016',
    name: 'Nescafe',
    shortName: 'Nescafe',
    aliases: ['nescafe', 'coffee shop', 'cafe', 'coffee'],
    category: 'food',
    subcategory: 'cafe',
    coordinates: { lat: 10.936951, lng: 76.742421 },
    floors: 1,
    departments: [],
    hours: { open: '08:00', close: '18:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: false, ramps: false },
    crowdLevel: 'high',
    icon: 'coffee',
    color: '#b45309',
    description: 'On-campus Nescafe outlet serving hot beverages and quick bites.',
    nearbyFacilities: ['AI & ML Dept', 'EEE Dept'],
    emergency: false,
    indoor: { floors: [{ level: 1, rooms: ['Counter', 'Seating Area'] }] }
  },
  {
    id: 'bld-017',
    name: 'Cake World',
    shortName: 'Cake World',
    aliases: ['cake world', 'bakery', 'cake shop', 'sweets'],
    category: 'food',
    subcategory: 'bakery',
    coordinates: { lat: 10.936467, lng: 76.742209 },
    floors: 1,
    departments: [],
    hours: { open: '09:00', close: '18:00', days: 'Mon-Sun' },
    accessibility: { wheelchair: false, elevator: false, ramps: false },
    crowdLevel: 'moderate',
    icon: 'cake',
    color: '#f472b6',
    description: 'Popular campus bakery with cakes, pastries, and snacks.',
    nearbyFacilities: ['AI & ML Dept', 'Biotech Dept'],
    emergency: false,
    indoor: { floors: [{ level: 1, rooms: ['Bakery Counter', 'Seating'] }] }
  },

  // ── HOSTELS ────────────────────────────────────────────────────────────────
  {
    id: 'bld-018',
    name: 'Living Star Ladies Hostel',
    shortName: 'Living Star Hostel',
    aliases: ['living star', 'ladies hostel', 'girls hostel', 'living star hostel', 'lslh'],
    category: 'hostel',
    subcategory: 'ladies',
    coordinates: { lat: 10.937006, lng: 76.740566 },
    floors: 5,
    departments: [],
    hours: { open: '00:00', close: '23:59', days: 'Mon-Sun' },
    accessibility: { wheelchair: false, elevator: false, ramps: false },
    crowdLevel: 'high',
    icon: 'home',
    color: '#ec4899',
    description: 'Ladies hostel with 500+ rooms, dining hall, and study areas.',
    nearbyFacilities: ['El-Shaddai Auditorium'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Reception', 'Warden Office', 'Dining Hall', 'Common Room'] },
        { level: 2, rooms: ['Rooms 101-150', 'Common Bathroom Block'] },
        { level: 3, rooms: ['Rooms 201-250', 'Study Hall'] },
        { level: 4, rooms: ['Rooms 301-350'] },
        { level: 5, rooms: ['Rooms 401-450', 'Terrace Garden'] }
      ]
    }
  },
  {
    id: 'bld-019',
    name: "Barnabas Men's Hostel",
    shortName: "Barnabas Hostel",
    aliases: ['barnabas', "men's hostel", 'gents hostel', 'boys hostel', 'barnabas hostel'],
    category: 'hostel',
    subcategory: 'mens',
    coordinates: { lat: 10.936200, lng: 76.740800 },
    floors: 5,
    departments: [],
    hours: { open: '00:00', close: '23:59', days: 'Mon-Sun' },
    accessibility: { wheelchair: false, elevator: false, ramps: false },
    crowdLevel: 'high',
    icon: 'home',
    color: '#3b82f6',
    description: "Primary men's hostel with residential rooms, mess hall, and recreation.",
    nearbyFacilities: ['Living Star Ladies Hostel'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Reception', 'Warden Office', 'Mess Hall'] },
        { level: 2, rooms: ['Rooms 101-150'] },
        { level: 3, rooms: ['Rooms 201-250', 'TV Room'] },
        { level: 4, rooms: ['Rooms 301-350'] },
        { level: 5, rooms: ['Rooms 401-450', 'Terrace'] }
      ]
    }
  },
  {
    id: 'bld-020',
    name: "Elijah Men's Hostel",
    shortName: "Elijah Hostel",
    aliases: ['elijah', 'elijah hostel', 'second mens hostel'],
    category: 'hostel',
    subcategory: 'mens',
    coordinates: { lat: 10.935900, lng: 76.740600 },
    floors: 4,
    departments: [],
    hours: { open: '00:00', close: '23:59', days: 'Mon-Sun' },
    accessibility: { wheelchair: false, elevator: false, ramps: false },
    crowdLevel: 'moderate',
    icon: 'home',
    color: '#1d4ed8',
    description: "Secondary men's hostel with modern amenities.",
    nearbyFacilities: ['Barnabas Hostel'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Reception', 'Common Room'] },
        { level: 2, rooms: ['Rooms 101-130'] },
        { level: 3, rooms: ['Rooms 201-230'] },
        { level: 4, rooms: ['Rooms 301-330'] }
      ]
    }
  },

  // ── ADMINISTRATION ─────────────────────────────────────────────────────────
  {
    id: 'bld-021',
    name: 'Administrative Block',
    shortName: 'Admin Block',
    aliases: ['admin', 'administration', 'admin block', 'principal office', 'registrar'],
    category: 'administration',
    subcategory: 'office',
    coordinates: { lat: 10.935800, lng: 76.744200 },
    floors: 3,
    departments: ['Principal Office', 'Registrar', 'Finance Office', 'Examination Cell', 'Admissions'],
    hours: { open: '09:00', close: '17:00', days: 'Mon-Fri' },
    accessibility: { wheelchair: true, elevator: true, ramps: true },
    crowdLevel: 'moderate',
    icon: 'landmark',
    color: '#1e40af',
    description: 'Main administrative building housing principal office, registrar, and exam cell.',
    nearbyFacilities: ['Central Library'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Reception', 'Admissions Office', 'Finance Counter', 'Student Services'] },
        { level: 2, rooms: ['Registrar Office', 'Exam Cell', 'Faculty Development Centre'] },
        { level: 3, rooms: ["Vice Chancellor's Office", "Principal's Office", 'Board Room'] }
      ]
    }
  },

  // ── TRAINING & PLACEMENT ───────────────────────────────────────────────────
  {
    id: 'bld-022',
    name: 'Placement Training Centre / Computer Technology Centre',
    shortName: 'Placement & CTC',
    aliases: ['placement', 'training centre', 'ctc', 'computer technology centre', 'placement office', 'tnp'],
    category: 'academic_support',
    subcategory: 'placement',
    coordinates: { lat: 10.935238, lng: 76.742563 },
    floors: 2,
    departments: ['Training & Placement', 'Aptitude Training', 'Technical Training'],
    hours: { open: '08:00', close: '18:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'moderate',
    icon: 'briefcase',
    color: '#059669',
    description: 'Dedicated placement training centre with mock interview rooms and aptitude labs.',
    nearbyFacilities: ['Central Library'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Aptitude Lab 1', 'Aptitude Lab 2', 'Interview Cabin 1', 'Interview Cabin 2'] },
        { level: 2, rooms: ['Placement Office', 'Group Discussion Room', 'Technical Interview Rooms'] }
      ]
    }
  },

  // ── MEDIA ──────────────────────────────────────────────────────────────────
  {
    id: 'bld-023',
    name: 'Karunya Media Centre',
    shortName: 'Media Centre',
    aliases: ['media centre', 'media center', 'studio', 'recording studio', 'kmc'],
    category: 'media',
    subcategory: 'media',
    coordinates: { lat: 10.934619, lng: 76.743365 },
    floors: 2,
    departments: ['Visual Communication', 'Media Production', 'Radio Station'],
    hours: { open: '09:00', close: '17:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: false, elevator: false, ramps: false },
    crowdLevel: 'low',
    icon: 'camera',
    color: '#7c3aed',
    description: 'Campus media production centre with recording studio and broadcast room.',
    nearbyFacilities: ['Central Library', 'Emmanuel Auditorium'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Recording Studio', 'Editing Suite', 'Photography Lab'] },
        { level: 2, rooms: ['Broadcast Room', 'Radio Station', 'Media Library'] }
      ]
    }
  },

  // ── PARKS & OUTDOORS ──────────────────────────────────────────────────────
  {
    id: 'bld-024',
    name: 'Rose Garden',
    shortName: 'Rose Garden',
    aliases: ['rose garden', 'garden', 'park', 'botanical garden'],
    category: 'outdoor',
    subcategory: 'garden',
    coordinates: { lat: 10.935404, lng: 76.741982 },
    floors: 0,
    departments: [],
    hours: { open: '06:00', close: '19:00', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'low',
    icon: 'flower-2',
    color: '#ec4899',
    description: 'Serene rose garden and botanical park — perfect for study breaks.',
    nearbyFacilities: ['Agriculture Dept', 'Food Processing Dept'],
    emergency: false,
    indoor: { floors: [] }
  },

  // ── MEDICAL ────────────────────────────────────────────────────────────────
  {
    id: 'bld-025',
    name: 'Campus Medical Centre',
    shortName: 'Medical Centre',
    aliases: ['medical centre', 'medical center', 'hospital', 'clinic', 'health centre', 'dispensary', 'first aid'],
    category: 'medical',
    subcategory: 'healthcare',
    coordinates: { lat: 10.936000, lng: 76.743500 },
    floors: 2,
    departments: ['General Medicine', 'Emergency', 'Pharmacy'],
    hours: { open: '07:00', close: '21:00', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'low',
    icon: 'cross',
    color: '#ef4444',
    description: '24×7 campus medical centre with doctors, nurses, and emergency care.',
    nearbyFacilities: ['Administrative Block'],
    emergency: true,
    indoor: {
      floors: [
        { level: 1, rooms: ['Emergency Room', 'OPD', 'Pharmacy', 'Waiting Area'] },
        { level: 2, rooms: ['Wards', 'Doctor Offices', 'Nursing Station'] }
      ]
    }
  },

  // ── SECURITY ───────────────────────────────────────────────────────────────
  {
    id: 'bld-026',
    name: 'Campus Security Office',
    shortName: 'Security',
    aliases: ['security', 'security office', 'campus security', 'guard'],
    category: 'security',
    subcategory: 'safety',
    coordinates: { lat: 10.936500, lng: 76.744000 },
    floors: 1,
    departments: ['Campus Security', 'CCTV Control'],
    hours: { open: '00:00', close: '23:59', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: false },
    crowdLevel: 'low',
    icon: 'shield-check',
    color: '#dc2626',
    description: '24×7 campus security office with CCTV monitoring.',
    nearbyFacilities: ['Administrative Block'],
    emergency: true,
    indoor: { floors: [{ level: 1, rooms: ['Control Room', 'Guard Station', 'CCTV Room'] }] }
  },

  // ── SPORTS ─────────────────────────────────────────────────────────────────
  {
    id: 'bld-027',
    name: 'Sports Complex',
    shortName: 'Sports Complex',
    aliases: ['sports', 'sports complex', 'gymnasium', 'gym', 'indoor stadium', 'sports ground'],
    category: 'sports',
    subcategory: 'athletics',
    coordinates: { lat: 10.934500, lng: 76.742500 },
    floors: 2,
    departments: ['Physical Education', 'NCC', 'NSS'],
    hours: { open: '06:00', close: '20:00', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'moderate',
    icon: 'dumbbell',
    color: '#0284c7',
    description: 'Sports complex with indoor badminton, table tennis, gym, and outdoor courts.',
    nearbyFacilities: ['Canteen'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Badminton Courts (4)', 'Table Tennis', 'Gymnasium', 'Changing Rooms'] },
        { level: 2, rooms: ['Weight Training Room', 'Yoga Room', 'Sports Office'] }
      ]
    }
  },

  // ── CHAPEL ─────────────────────────────────────────────────────────────────
  {
    id: 'bld-028',
    name: 'Campus Chapel',
    shortName: 'Chapel',
    aliases: ['chapel', 'church', 'prayer hall', 'worship'],
    category: 'religious',
    subcategory: 'chapel',
    coordinates: { lat: 10.935700, lng: 76.742800 },
    floors: 1,
    departments: [],
    hours: { open: '06:00', close: '20:00', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'variable',
    icon: 'heart',
    color: '#db2777',
    description: 'Campus chapel for prayer, meditation, and spiritual activities.',
    nearbyFacilities: ['Administrative Block'],
    emergency: false,
    indoor: { floors: [{ level: 1, rooms: ['Main Hall', 'Prayer Room', 'Counselling Room'] }] }
  },

  // ── PARKING ────────────────────────────────────────────────────────────────
  {
    id: 'bld-029',
    name: 'Main Parking Zone A',
    shortName: 'Parking Zone A',
    aliases: ['parking', 'main parking', 'car park', 'two wheeler parking', 'vehicle parking'],
    category: 'parking',
    subcategory: 'vehicle',
    coordinates: { lat: 10.936800, lng: 76.744200 },
    floors: 0,
    departments: [],
    hours: { open: '06:00', close: '22:00', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'moderate',
    icon: 'car',
    color: '#64748b',
    description: 'Main vehicle parking zone near the main gate.',
    nearbyFacilities: ['Administrative Block', 'Security Office'],
    emergency: false,
    indoor: { floors: [] }
  },
  {
    id: 'bld-030',
    name: 'Staff Parking Zone B',
    shortName: 'Staff Parking',
    aliases: ['staff parking', 'faculty parking', 'parking zone b'],
    category: 'parking',
    subcategory: 'vehicle',
    coordinates: { lat: 10.934800, lng: 76.743800 },
    floors: 0,
    departments: [],
    hours: { open: '07:00', close: '20:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: true, elevator: false, ramps: false },
    crowdLevel: 'moderate',
    icon: 'car',
    color: '#94a3b8',
    description: 'Dedicated faculty and staff parking area.',
    nearbyFacilities: ['Administrative Block'],
    emergency: false,
    indoor: { floors: [] }
  },

  // ── GATE / ENTRY ────────────────────────────────────────────────────────────
  {
    id: 'bld-031',
    name: 'Main Gate',
    shortName: 'Main Gate',
    aliases: ['main gate', 'entrance', 'gate', 'front gate', 'entry'],
    category: 'gate',
    subcategory: 'entry',
    coordinates: { lat: 10.937200, lng: 76.744800 },
    floors: 0,
    departments: [],
    hours: { open: '00:00', close: '23:59', days: 'Mon-Sun' },
    accessibility: { wheelchair: true, elevator: false, ramps: true },
    crowdLevel: 'high',
    icon: 'door-open',
    color: '#78716c',
    description: 'Main entry gate to Karunya University campus.',
    nearbyFacilities: ['Security Office', 'Parking Zone A'],
    emergency: true,
    indoor: { floors: [] }
  },

  // ── LABS (standalone) ─────────────────────────────────────────────────────
  {
    id: 'bld-032',
    name: 'Central Research Laboratory',
    shortName: 'Central Lab',
    aliases: ['central lab', 'research lab', 'central research', 'crl'],
    category: 'laboratory',
    subcategory: 'research',
    coordinates: { lat: 10.935600, lng: 76.743000 },
    floors: 3,
    departments: ['Multi-disciplinary Research', 'Materials Science', 'Nanotechnology'],
    hours: { open: '08:00', close: '18:00', days: 'Mon-Sat' },
    accessibility: { wheelchair: false, elevator: false, ramps: false },
    crowdLevel: 'low',
    icon: 'flask-conical',
    color: '#0d9488',
    description: 'Central research facility with advanced instruments and multi-disciplinary labs.',
    nearbyFacilities: ['Administrative Block', 'Central Library'],
    emergency: false,
    indoor: {
      floors: [
        { level: 1, rooms: ['Material Testing Lab', 'Wet Chemistry Lab', 'Sample Preparation'] },
        { level: 2, rooms: ['Nanotechnology Lab', 'SEM Room', 'XRD Room'] },
        { level: 3, rooms: ['FTIR Lab', 'Research Coordinator Office', 'Documentation Centre'] }
      ]
    }
  },
];

/**
 * Category metadata for UI rendering
 */
const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'layout-grid', color: '#6366f1' },
  { id: 'academic', label: 'Departments', icon: 'graduation-cap', color: '#3b82f6' },
  { id: 'hostel', label: 'Hostels', icon: 'home', color: '#ec4899' },
  { id: 'food', label: 'Food', icon: 'utensils', color: '#f59e0b' },
  { id: 'library', label: 'Library', icon: 'book-open', color: '#7c3aed' },
  { id: 'auditorium', label: 'Auditoriums', icon: 'mic', color: '#dc2626' },
  { id: 'sports', label: 'Sports', icon: 'dumbbell', color: '#0284c7' },
  { id: 'parking', label: 'Parking', icon: 'car', color: '#64748b' },
  { id: 'medical', label: 'Medical', icon: 'cross', color: '#ef4444' },
  { id: 'laboratory', label: 'Labs', icon: 'flask-conical', color: '#0d9488' },
];

/**
 * Emergency contact info
 */
const EMERGENCY_CONTACTS = {
  medical: { name: 'Campus Medical Centre', phone: '0422-2614300', location: 'bld-025' },
  security: { name: 'Campus Security', phone: '0422-2614200', location: 'bld-026' },
  fire: { name: 'Fire Station (External)', phone: '101', location: null },
  ambulance: { name: 'Ambulance', phone: '108', location: null },
};

module.exports = { CAMPUS_BUILDINGS, CATEGORIES, EMERGENCY_CONTACTS };
