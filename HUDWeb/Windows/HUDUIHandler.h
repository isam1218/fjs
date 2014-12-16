#pragma once

#include "stdafx.h"
#include <mshtmhst.h>
#include "CJSObject.h"

class HUDUIHandler : 
	public IDispatchImpl<IDocHostUIHandler, &IID_IDocHostUIHandler>,
	public CComCoClass<HUDUIHandler, &CLSID_DocHostUIHandler>,
	public CComObjectRootEx<CComMultiThreadModel>
{
private:
	CComPtr<CComObject<CCJSObject>> js;

public:

	HUDUIHandler() 
	{
		HRESULT hRet = CComObject<CCJSObject>::CreateInstance(&js);

		ATLASSERT(SUCCEEDED(hRet));
	};


public:

	BEGIN_COM_MAP(HUDUIHandler)
		COM_INTERFACE_ENTRY(IDocHostUIHandler)
//		COM_INTERFACE_ENTRY(IDispatch)
	END_COM_MAP()

	HRESULT STDMETHODCALLTYPE ShowContextMenu(
		/* [annotation][in] */
		_In_  DWORD dwID,
		/* [annotation][in] */
		_In_  POINT *ppt,
		/* [annotation][in] */
		_In_  IUnknown *pcmdtReserved,
		/* [annotation][in] */
		_In_  IDispatch *pdispReserved)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE GetHostInfo(
		/* [annotation][out][in] */
		_Inout_  DOCHOSTUIINFO *pInfo)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE ShowUI(
		/* [annotation][in] */
		_In_  DWORD dwID,
		/* [annotation][in] */
		_In_  IOleInPlaceActiveObject *pActiveObject,
		/* [annotation][in] */
		_In_  IOleCommandTarget *pCommandTarget,
		/* [annotation][in] */
		_In_  IOleInPlaceFrame *pFrame,
		/* [annotation][in] */
		_In_  IOleInPlaceUIWindow *pDoc)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE HideUI(void)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE UpdateUI(void)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE EnableModeless(
		/* [in] */ BOOL fEnable)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE OnDocWindowActivate(
		/* [in] */ BOOL fActivate)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE OnFrameWindowActivate(
		/* [in] */ BOOL fActivate)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE ResizeBorder(
		/* [annotation][in] */
		_In_  LPCRECT prcBorder,
		/* [annotation][in] */
		_In_  IOleInPlaceUIWindow *pUIWindow,
		/* [annotation][in] */
		_In_  BOOL fRameWindow)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE TranslateAccelerator(
		/* [in] */ LPMSG lpMsg,
		/* [in] */ const GUID *pguidCmdGroup,
		/* [in] */ DWORD nCmdID)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE GetOptionKeyPath(
		/* [annotation][out] */
		_Out_  LPOLESTR *pchKey,
		/* [in] */ DWORD dw)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE GetDropTarget(
		/* [annotation][in] */
		_In_  IDropTarget *pDropTarget,
		/* [annotation][out] */
		_Outptr_  IDropTarget **ppDropTarget)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE GetExternal(
		/* [annotation][out] */
		_Outptr_result_maybenull_  IDispatch **ppDispatch)
	{
		*ppDispatch = (IDispatch*)js;

		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE TranslateUrl(
		/* [in] */ DWORD dwTranslate,
		/* [annotation][in] */
		_In_  LPWSTR pchURLIn,
		/* [annotation][out] */
		_Outptr_  LPWSTR *ppchURLOut)
	{
		return S_OK;
	}

	virtual HRESULT STDMETHODCALLTYPE FilterDataObject(
		/* [annotation][in] */
		_In_  IDataObject *pDO,
		/* [annotation][out] */
		_Outptr_result_maybenull_  IDataObject **ppDORet)
	{
		return S_OK;
	}
};
