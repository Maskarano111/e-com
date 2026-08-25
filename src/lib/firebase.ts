import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  initialProducts,
  initialCategories,
  initialBanners,
  initialCoupons
} from '../data/initialData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Seed initial database collections if not present
let isSeeded = false;
export async function ensureDatabaseSeeded(): Promise<void> {
  if (isSeeded) return;
  try {
    // 1. Check if products exist in Firestore
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty) {
      console.log('🌱 Seeding initial products, categories, banners & coupons to Firestore...');
      const batch = writeBatch(db);

      // Seed products
      initialProducts.forEach((prod) => {
        const ref = doc(db, 'products', prod.id);
        batch.set(ref, {
          ...prod,
          createdAt: prod.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });

      // Seed categories
      initialCategories.forEach((cat) => {
        const ref = doc(db, 'categories', cat.id);
        batch.set(ref, cat);
      });

      // Seed banners
      initialBanners.forEach((ban) => {
        const ref = doc(db, 'banners', ban.id);
        batch.set(ref, ban);
      });

      // Seed coupons
      initialCoupons.forEach((cp) => {
        const ref = doc(db, 'coupons', cp.id);
        batch.set(ref, cp);
      });

      await batch.commit();
      console.log('✅ Firestore seeding successfully completed.');
    }
    isSeeded = true;
  } catch (err) {
    console.warn('Firestore initial check/seed:', err);
  }
}

// Test initial connection
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline. Checking connection...');
    }
  }
}
testFirestoreConnection();
ensureDatabaseSeeded();
