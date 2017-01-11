//Changed from lib.d.ts of typescript 0.9.0

/* *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0  
 
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, 
MERCHANTABLITY OR NON-INFRINGEMENT. 
 
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/// <reference no-default-lib="true"/>

//console object for node.js

interface Console {
    info(): void;
    info(message: any, ...optionalParams: any[]): void;
    assert(): void;
    assert(test: boolean): void;
    assert(test: boolean, message: any, ...optionalParams: any[]): void;
    clear(): boolean;
    dir(): boolean;
    dir(value: any, ...optionalParams: any[]): boolean;
    warn(): void;
    warn(message: any, ...optionalParams: any[]): void;
    error(): void;
    error(message: any, ...optionalParams: any[]): void;
    log(): void;
    log(message: any, ...optionalParams: any[]): void;

    //deleted
    //msIsIndependentlyComposed(element: Element): boolean;
    //profile(reportName?: string): boolean;
    //profileEnd(): boolean;

    //added
    time(label:string): void;
    timeEnd(label:string): void;
    trace(label: string): void;
}
declare var Console: {
    prototype: Console;
    new(): Console;
}

declare var console: Console;
