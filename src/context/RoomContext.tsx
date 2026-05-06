import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc,
  setDoc,
  getDocFromServer
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { Room, ContactMessage, User, Review, AppSettings, MediaLibraryItem } from '../types';
import { CONTACT_INFO, COMMON_AMENITIES } from '../constants';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface RoomContextType {
  rooms: Room[];
  messages: ContactMessage[];
  reviews: Review[];
  currentUser: User | null;
  isAuthReady: boolean;
  addRoom: (room: Omit<Room, 'id' | 'createdAt'>) => Promise<void>;
  updateRoom: (id: string, room: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addMessage: (message: Omit<ContactMessage, 'id' | 'createdAt'>) => Promise<void>;
  updateMessage: (id: string, message: Partial<ContactMessage>) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateReview: (id: string, review: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  favorites: string[];
  toggleFavorite: (roomId: string) => void;
  settings: AppSettings;
  amenities: string[];
  media: MediaLibraryItem[];
  addMedia: (media: Omit<MediaLibraryItem, 'id' | 'createdAt'>) => Promise<void>;
  deleteMedia: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  updateAmenities: (amenities: string[]) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [media, setMedia] = useState<MediaLibraryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    hotline: CONTACT_INFO.phone,
    zalo: CONTACT_INFO.zalo,
    fanpage: CONTACT_INFO.facebook
  });
  const [amenities, setAmenities] = useState<string[]>(COMMON_AMENITIES);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('duytimtro_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('duytimtro_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setCurrentUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
          } else {
            // If user exists in Auth but not in Firestore, create a default profile
            // This can happen on first social login
            const newUser: Omit<User, 'id'> = {
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: firebaseUser.email?.toLowerCase() === 'tranduongtuanduy.6a4@gmail.com'.toLowerCase() ? 'admin' : 'customer',
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUser,
              createdAt: serverTimestamp()
            });
            setCurrentUser({ id: firebaseUser.uid, ...newUser } as User);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Rooms listener
  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to ISO string for UI consistency if needed, 
        // or keep as is if UI handles it.
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Room[];
      setRooms(roomsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  // Messages listener (Admin only)
  useEffect(() => {
    if (!isAuthReady || currentUser?.role !== 'admin') {
      setMessages([]);
      return;
    }

    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as ContactMessage[];
      setMessages(messagesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    return () => unsubscribe();
  }, [isAuthReady, currentUser]);

  // Reviews listener
  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Review[];
      setReviews(reviewsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  // Media listener
  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as MediaLibraryItem[];
      setMedia(mediaData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'media');
    });

    return () => unsubscribe();
  }, []);

  // Settings & Amenities listener
  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'config', 'settings'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as AppSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/settings');
    });

    const unsubAmenities = onSnapshot(doc(db, 'config', 'amenities'), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as { list: string[] };
        if (data.list) setAmenities(data.list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/amenities');
    });

    return () => {
      unsubSettings();
      unsubAmenities();
    };
  }, []);

  const addRoom = async (roomData: Omit<Room, 'id' | 'createdAt'>) => {
    const path = 'rooms';
    try {
      const cleanData = Object.fromEntries(
        Object.entries(roomData).filter(([_, v]) => v !== undefined && v !== null)
      );
      await addDoc(collection(db, path), {
        ...cleanData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateRoom = async (id: string, roomData: Partial<Room>) => {
    const path = `rooms/${id}`;
    try {
      const cleanData = Object.fromEntries(
        Object.entries(roomData).filter(([_, v]) => v !== undefined && v !== null)
      );
      const roomRef = doc(db, 'rooms', id);
      await updateDoc(roomRef, cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteRoom = async (id: string) => {
    const path = `rooms/${id}`;
    try {
      await deleteDoc(doc(db, 'rooms', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addMessage = async (messageData: Omit<ContactMessage, 'id' | 'createdAt'>) => {
    const path = 'messages';
    try {
      // Remove undefined and null fields as Firestore doesn't support them well in rules if not expected
      const cleanData = Object.fromEntries(
        Object.entries(messageData).filter(([_, v]) => v !== undefined && v !== null)
      );

      await addDoc(collection(db, path), {
        ...cleanData,
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateMessage = async (id: string, messageData: Partial<ContactMessage>) => {
    const path = `messages/${id}`;
    try {
      const cleanData = Object.fromEntries(
        Object.entries(messageData).filter(([_, v]) => v !== undefined && v !== null)
      );
      const messageRef = doc(db, 'messages', id);
      await updateDoc(messageRef, cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteMessage = async (id: string) => {
    const path = `messages/${id}`;
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>) => {
    const path = 'reviews';
    try {
      const cleanData = Object.fromEntries(
        Object.entries(reviewData).filter(([_, v]) => v !== undefined && v !== null)
      );

      await addDoc(collection(db, path), {
        ...cleanData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateReview = async (id: string, reviewData: Partial<Review>) => {
    const path = `reviews/${id}`;
    try {
      const cleanData = Object.fromEntries(
        Object.entries(reviewData).filter(([_, v]) => v !== undefined && v !== null)
      );
      const reviewRef = doc(db, 'reviews', id);
      await updateDoc(reviewRef, cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteReview = async (id: string) => {
    const path = `reviews/${id}`;
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addMedia = async (mediaData: Omit<MediaLibraryItem, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'media'), {
        ...mediaData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'media');
    }
  };

  const deleteMedia = async (id: string) => {
    if (!id) {
      console.error('Delete media failed: ID is missing');
      throw new Error('ID hình ảnh không hợp lệ');
    }
    
    try {
      const mediaRef = doc(db, 'media', id);
      await deleteDoc(mediaRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `media/${id}`);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const toggleFavorite = (roomId: string) => {
    setFavorites(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId) 
        : [...prev, roomId]
    );
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const settingsRef = doc(db, 'config', 'settings');
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists()) {
        await updateDoc(settingsRef, newSettings);
      } else {
        await setDoc(settingsRef, {
          hotline: CONTACT_INFO.phone,
          zalo: CONTACT_INFO.zalo,
          fanpage: CONTACT_INFO.facebook,
          ...newSettings
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'config/settings');
    }
  };

  const updateAmenities = async (newAmenities: string[]) => {
    try {
      const amenitiesRef = doc(db, 'config', 'amenities');
      await setDoc(amenitiesRef, { list: newAmenities });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'config/amenities');
    }
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        messages,
        reviews,
        currentUser,
        isAuthReady,
        addRoom,
        updateRoom,
        deleteRoom,
        addMessage,
        updateMessage,
        deleteMessage,
        addReview,
        updateReview,
        deleteReview,
        logout,
        favorites,
        toggleFavorite,
        settings,
        amenities,
        media,
        addMedia,
        deleteMedia,
        updateSettings,
        updateAmenities,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRooms = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRooms must be used within a RoomProvider');
  }
  return context;
};
