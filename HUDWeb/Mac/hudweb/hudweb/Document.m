//
//  Document.m
//  hudweb
//
//  Created by Chip Wiley on 11/20/14.
//  Copyright (c) 2014 Chip Wiley. All rights reserved.
//

#import "Document.h"

@interface Document ()

@end

@implementation Document

- (instancetype)init {
    self = [super init];
    if (self) {
        // Add your subclass-specific initialization here.
    }
    return self;
}

- (void)windowControllerDidLoadNib:(NSWindowController *)aController {
    [super windowControllerDidLoadNib:aController];
    // Add any code here that needs to be executed once the windowController has loaded the document's window.
}

+ (BOOL)autosavesInPlace {
    return YES;
}

- (void)makeWindowControllers {
    // Override to return the Storyboard file name of the document.
    [self addWindowController:[[NSStoryboard storyboardWithName:@"Main" bundle:nil] instantiateControllerWithIdentifier:@"Document Window Controller"]];
}

@end
