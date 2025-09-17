export interface FormData {
  affiliation: string;
  nameKorean: string;
  nameEnglish: string;
  membershipType: '단체' | '개인' | '';
  gender: '남' | '여' | '';
  email: string;
  phoneApplicant: string;
  guardianRelationship: '부' | '모' | '';
  guardianName: string;
  guardianPhone: string;
  address: string;
  signature: string;
  dateOfBirth: string;
}