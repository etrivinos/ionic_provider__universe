import { Http, Headers } from '@angular/http';
import { Injectable } from '@angular/core';

import { universeConfig } from './universe.config';

declare var localStorage;

@Injectable()
export class UniverseProvider {

  constructor(public http: Http) {}

  /**
  * Get the access token
  * @method getAccessToken
    Example: 
        {
          id: '<universe_app_id>',
          cs: '<universe_slient_secret>',
        }
  * @return Promise
    {
      "access_token": "318619e038eeacbe8e11e9abf1432dc6b3fdba08d6f8a6a4c55692ff95a43101",
      "token_type": "Bearer",
      "expires_in": 2592000,
      "scope": "public",
      "created_at": 1558959578
    }
  */
  getAccessToken() {
  	let headers = new Headers();
    let dataToSend = {
    	"grant_type": 		"client_credentials",
    	"client_id":			universeConfig.credentials.id,
    	"client_secret":	universeConfig.credentials.cs
    };

    headers.append('Content-Type', 'application/json');

    return new Promise((resolve, reject) => {
      this.http.post(
  	    [
          universeConfig.path.base,
          universeConfig.path.api.access_token, 
        ].join(''),
        dataToSend,
        { headers: headers }
      )
      .subscribe(response => {
        let resp = response.json();
        this.setAccessTokenInfo(resp);
        resolve(resp);
      }, (error) => {
        reject(error.json());
      });
    });
  }

  /**
  * Set access token info
  * @method setAccessTokenInfo
  */
  setAccessTokenInfo(accessTokenData) {
    localStorage.setItem('universe-acces-data', JSON.stringify(accessTokenData));
  }

  /**
  * Get access token info
  * @method getAccessTokenInfo
  */
  getAccessTokenInfo() {
    let data = localStorage.getItem('universe-acces-data');
    if(data) { return JSON.parse(data); }
    return null;
  }

  /**
  * Get access token info
  * @method getAccessTokenInfo
  */
  getAccessTokenId() {
    let data = this.getAccessTokenInfo();
    if(data) { return data.access_token; }

    return null;
  }

  /**
  * Send request to universe
  * @method sendRequestToUniverse
  * @return Promise
  */
  sendRequestToUniverse(endpoint, data: any = {}) {
    let params  = this.serialize(data);
    let headers = new Headers();

    headers.append('authorization', ['Bearer ', this.getAccessTokenId()].join(''));

    return new Promise((resolve, reject) => {
      this.http.get(
        [
          universeConfig.path.base,
          endpoint,
          params
        ].join(''),
        { headers: headers }
      )
      .subscribe(response => {
        let resp = response.json();
        resolve(resp);
      }, (error) => {
        reject(error.json());
      });
    });
  }

  /**
  * Get the guest lists
  * @method getGuestLists
  * @description 
    QUERY PARAMS  
      limit       string    The limit on the number of returned documents, max 1000                                         100
      offset      string    The number of documents to skip in the result set (the starting point for the set returned)     0
      since       string    An ISO8601 timestamp, which filters for documents updated/created after this moment in time.
      event_id    string    Restrict the Guestlist to just one Event
      listing_id  string    Restrict the Guestlist to just one Listing
  * @return
      "data": {
        "guestlist": [{
          "id": String,
          "token": String
          "state": StateEnum,
          "updated_at": ISO8601String,
          "created_at": ISO8601String,
          "buyer": {
            "email": String,
            "name": String,
            "id": String
          },
          "attendee": {
            "email": String,
            "name": String,
            "id": String
          },
          "ticket_type": {
            "name": String,
            "price": Float,
            "id": String
          },
          "order": {
            "discount_code": String,
            "id": String,
            "currency": String
          },
          "listing": {
            "title": String,
            "id": String
          },
          "event": {
            "id": String,
            "start_stamp": UnixEpochInteger,
            "end_stamp": UnixEpochInteger
          },
          "answers": {
            "name": String,
            "value": String
          }
        }]
      },
      "meta": {
        "count": Int, 
        "limit": Int,
        "offset": Int
      }
    } 
  */
  getGuestLists(data: any = {}) {
    return new Promise((resolve, reject) => {
      this.sendRequestToUniverse('api/v2/guestlists', data)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
  * Get the current user
  * @method getCurrentUser
  * @return
    {
      "current_user": {
        "id": String,
        "slug": String,
        "first_name": String,
        "last_name": String,
        "created_at": ISO8601String,
        "updated_at": ISO8601String,
        "email": String
      }
    }
  */
  getCurrentUser(data: any = {}) {
    return new Promise((resolve, reject) => {
      this.sendRequestToUniverse('api/v2/current_user', data)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

   /**
  * Get the user lists
  * @method getListings
  * @return
    {
      "listings": [
        {
          "id": String,
          "title": String
        }
      ],
      "meta": {
        "count": Int, 
        "limit": Int,
        "offset": Int
      }
    } 
  */
  getListings(data: any = {}) {
    return new Promise((resolve, reject) => {
      this.sendRequestToUniverse('api/v2/listings', data)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Serializes the form element so it can be passed to the back end through the url.
   * The objects properties are the keys and the objects values are the values.
   * ex: { "a":1, "b":2, "c":3 } would look like ?a=1&b=2&c=3
   * @param obj - Object to be url encoded
   */
  serialize(data: any): string {
    let params : any = [];

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        let keyValuePair = [key, data[key]].join('=');
        params.push(keyValuePair);
      }
    }

    params = params.join('&');
    return params ? '?' + params : '';
  }

}
