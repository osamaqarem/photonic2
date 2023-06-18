//
//  UploadService.m
//  photonic
//
//  Created by Osama Qarem on 23/08/2022.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(UploadService, NSObject)

RCT_EXTERN_METHOD(uploadAssets: (NSDictionaryArray *)data)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
