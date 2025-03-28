// import type { Tables } from '@/types_db';
import { Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from 'firebase/auth';
import { createUserDocument, getUserDocument } from './firestore';

// type Price = Tables<'prices'>;

// Authentication helpers
export const registerUser = async (email: string, password: string, name: string, username: string): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create the user document in Firestore
    await createUserDocument({
      uid: userCredential.user.uid,
      email,
      name,
      username
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Date helpers
export const formatTimestamp = (timestamp: Timestamp): string => {
  return timestamp.toDate().toLocaleDateString();
};

export const formatDatetime = (timestamp: Timestamp): string => {
  return timestamp.toDate().toLocaleString();
};

export const toDateTime = (secs: number) => {
  var t = new Date(+0); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

export const timestampToUnix = (timestamp: Timestamp): number => {
  return timestamp.seconds;
};

export const unixToTimestamp = (unix: number): Timestamp => {
  return Timestamp.fromMillis(unix * 1000);
};

// URL and API helpers
export const getURL = (path: string = '') => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL &&
    process.env.NEXT_PUBLIC_SITE_URL.trim() !== ''
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process?.env?.NEXT_PUBLIC_VERCEL_URL &&
          process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== ''
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        : 'http://localhost:3000/';

  url = url.replace(/\/+$/, '');
  url = url.includes('http') ? url : `https://${url}`;
  path = path.replace(/^\/+/, '');

  return path ? `${url}/${path}` : url;
};

export const postData = async ({
  url,
  // data
}: {
  url: string;
  // data?: { price: Price } | any;
}) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    // body: JSON.stringify(data)
  });

  return res.json();
};

// Debate helpers
export const formatDebateResult = (result: 'win' | 'loss' | 'draw' | 'ongoing'): string => {
  switch (result) {
    case 'win':
      return 'Victory';
    case 'loss':
      return 'Defeat';
    case 'draw':
      return 'Draw';
    case 'ongoing':
      return 'In Progress';
    default:
      return 'Unknown';
  }
};

export const canStartNewDebate = async (uid: string): Promise<boolean> => {
  try {
    const userData = await getUserDocument(uid);
    return userData ? userData.remainingFreeDebates > 0 : false;
  } catch (error) {
    console.error('Error checking debate eligibility:', error);
    return false;
  }
};

// Toast notification helpers
const toastKeyMap: { [key: string]: string[] } = {
  status: ['status', 'status_description'],
  error: ['error', 'error_description']
};

const getToastRedirect = (
  path: string,
  toastType: string,
  toastName: string,
  toastDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
): string => {
  const [nameKey, descriptionKey] = toastKeyMap[toastType];

  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`;
  }

  if (disableButton) {
    redirectPath += `&disable_button=true`;
  }

  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`;
  }

  return redirectPath;
};

export const getStatusRedirect = (
  path: string,
  statusName: string,
  statusDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(
    path,
    'status',
    statusName,
    statusDescription,
    disableButton,
    arbitraryParams
  );

export const getErrorRedirect = (
  path: string,
  errorName: string,
  errorDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(
    path,
    'error',
    errorName,
    errorDescription,
    disableButton,
    arbitraryParams
  );

export const calculateTrialEndUnixTimestamp = (
  trialPeriodDays: number | null | undefined
) => {
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined;
  }

  const currentDate = new Date();
  const trialEnd = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000
  );
  return Math.floor(trialEnd.getTime() / 1000);
};
