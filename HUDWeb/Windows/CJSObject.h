// CJSObject.h : Declaration of the CCJSObject

#pragma once
#include "resource.h"       // main symbols
#include "stdafx.h"

#include <atlframe.h>
#include <atlctrls.h>
#include <atlctrlx.h>
#include <atlctrlw.h>
#include <atldlgs.h>
#include <atlmisc.h>
#include "HUD.h"


#if defined(_WIN32_WCE) && !defined(_CE_DCOM) && !defined(_CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA)
#error "Single-threaded COM objects are not properly supported on Windows CE platform, such as the Windows Mobile platforms that do not include full DCOM support. Define _CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA to force ATL to support creating single-thread COM object's and allow use of it's single-threaded COM object implementations. The threading model in your rgs file was set to 'Free' as that is the only threading model supported in non DCOM Windows CE platforms."
#endif

using namespace ATL;


// CCJSObject

class ATL_NO_VTABLE CCJSObject :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CCJSObject, &CLSID_CJSObject>,
//	public ISupportErrorInfo,
//	public IConnectionPointContainerImpl<CCJSObject>,
//	public CProxy_ICJSObjectEvents<CCJSObject>,
	public IObjectWithSiteImpl<CCJSObject>,
	public IDispatchImpl<ICJSObject, &IID_ICJSObject, &LIBID_ATLProject1Lib, /*wMajor =*/ 1, /*wMinor =*/ 0>
{
public:
	CCJSObject()
	{
	}

	DECLARE_REGISTRY_RESOURCEID(IDR_CJSOBJECT)


	BEGIN_COM_MAP(CCJSObject)
		COM_INTERFACE_ENTRY(ICJSObject)
		COM_INTERFACE_ENTRY(IDispatch)
//		COM_INTERFACE_ENTRY(ISupportErrorInfo)
//		COM_INTERFACE_ENTRY(IConnectionPointContainer)
		COM_INTERFACE_ENTRY(IObjectWithSite)
	END_COM_MAP()

	//BEGIN_CONNECTION_POINT_MAP(CCJSObject)
	//	CONNECTION_POINT_ENTRY(__uuidof(_ICJSObjectEvents))
	//END_CONNECTION_POINT_MAP()
	// ISupportsErrorInfo
	//STDMETHOD(InterfaceSupportsErrorInfo)(REFIID riid);


	DECLARE_PROTECT_FINAL_CONSTRUCT()

	HRESULT FinalConstruct()
	{
		return S_OK;
	}

	void FinalRelease()
	{
	}

public:
	HRESULT ShowNotification(BSTR message) {

	}


};

OBJECT_ENTRY_AUTO(__uuidof(CJSObject), CCJSObject)
