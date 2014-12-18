//
//  ViewController.m
//  hudweb
//
//  Created by Chip Wiley on 11/20/14.
//  Copyright (c) 2014 Chip Wiley. All rights reserved.
//

#import "ViewController.h"
@import WebKit;

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    WebView *webView = (WebView*)self.view;
    
 //   NSString *urlText = @"http://localhost:9900/app/";
    NSString *urlText = @"https://huc-dev.fonality.com/repository/hudweb/2.0/app/";
 //   NSString *urlText = @"http://hudweb.fonality.com";
    [[webView mainFrame] loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:urlText]]];
}

- (void)setRepresentedObject:(id)representedObject {
    [super setRepresentedObject:representedObject];

    // Update the view, if already loaded.
}

@end
