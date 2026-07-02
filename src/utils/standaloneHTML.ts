import { Student, Payment, HostelSettings, Complaint, Visitor } from '../types';
import offlineTemplate from '../assets/offline_template.html?raw';

export function generateStandaloneHTML(
  students: Student[],
  payments: Payment[],
  settings: HostelSettings,
  complaints: Complaint[] = [],
  visitors: Visitor[] = []
): string {
  let template = offlineTemplate;
  if (!template) {
    return '<h2>Error: Failed to load template. Please contact admin.</h2>';
  }
  
  // Replace placeholders dynamically with stringified active database collections safely
  // Using functions for replace is critical to prevent JavaScript's special "$" character sequence parsing bugs
  template = template.replace('##_STUDENTS_JSON_##', () => JSON.stringify(students || []));
  template = template.replace('##_PAYMENTS_JSON_##', () => JSON.stringify(payments || []));
  template = template.replace('##_COMPLAINTS_JSON_##', () => JSON.stringify(complaints || []));
  template = template.replace('##_VISITORS_JSON_##', () => JSON.stringify(visitors || []));
  template = template.replace('##_SETTINGS_JSON_##', () => JSON.stringify(settings || {}));
  template = template.replace('##_TIMESTAMP_##', () => Date.now().toString());

  // Replace relative asset paths with absolute URLs from the active hosted environment origin
  let origin = '';
  if (typeof window !== 'undefined' && window.location) {
    origin = window.location.origin;
  }
  if (!origin) {
    origin = 'https://ais-pre-cwfhs3kjnhahsqos4mg4ru-1012192092682.asia-southeast1.run.app';
  }
  template = template.replaceAll('/src/assets/images/unity_hostel_logo_1781847359405.jpg', `${origin}/src/assets/images/unity_hostel_logo_1781847359405.jpg`);

  return template;
}

