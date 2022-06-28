import { Injectable, Inject } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable({
    providedIn: 'root'
})
export class PersistenceService {
    private browserStorageKeyPrefix = 'ngFp-';
    constructor(
        @Inject(LOCAL_STORAGE) private browserStorage: StorageService
    ) {
    }

    storeLocalSetting(key, value) {
        this.browserStorage.set(this.browserStorageKeyPrefix + key, value);
    }

    loadLocalSetting(key) {
        return this.browserStorage.get(this.browserStorageKeyPrefix + key);
    }

    deleteLocalSetting(key) {
        this.browserStorage.remove(this.browserStorageKeyPrefix + key);
    }
}
