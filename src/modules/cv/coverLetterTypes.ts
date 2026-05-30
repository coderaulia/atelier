export interface CoverLetterData {
  companyName: string;
  hiringManager: string;
  position: string;
  body: string;
}

export const DEFAULT_COVER_LETTER: CoverLetterData = {
  companyName: '',
  hiringManager: '',
  position: '',
  body: '',
};
