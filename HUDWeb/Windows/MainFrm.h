// MainFrm.h : interface of the CMainFrame class
//
/////////////////////////////////////////////////////////////////////////////

#pragma once

#define WINDOW_MENU_POSITION	3


class CMainFrame : public CFrameWindowImpl<CMainFrame>, public CUpdateUI<CMainFrame>,
		public CMessageFilter, public CIdleHandler
{
private:
	HWND m_hWnd;
	CBrowserView* pView = NULL;

public:
	DECLARE_FRAME_WND_CLASS(_T("TabBrowser_MainFrame"), IDR_MAINFRAME)

	CString m_strHomePage;

// CMessageFilter
	virtual BOOL PreTranslateMessage(MSG* pMsg)
	{
		if(ProcessComboReturnKey(pMsg) != FALSE)
			return TRUE;

		return CFrameWindowImpl<CMainFrame>::PreTranslateMessage(pMsg);
	}

	BOOL ProcessComboReturnKey(MSG* /*pMsg*/)
	{
		return FALSE;
	}

// CIdleHandler
	virtual BOOL OnIdle()
	{

		return FALSE;
	}

// Methods
	bool GetHomePage()
	{
		LPCTSTR lpstrHomePageRegKey = _T("Software\\Microsoft\\Internet Explorer\\Main");
		LPCTSTR lpstrHomePageRegValue = _T("Start Page");

		CRegKeyEx rk;
		LONG lRet = rk.Open(HKEY_CURRENT_USER, lpstrHomePageRegKey);
		ATLASSERT(lRet == ERROR_SUCCESS);
		if(lRet != ERROR_SUCCESS)
			return false;

		ULONG ulLength = 0;
		lRet = rk.QueryStringValue(lpstrHomePageRegValue, NULL, &ulLength);
		if(lRet == ERROR_SUCCESS)
			lRet = rk.QueryStringValue(lpstrHomePageRegValue, m_strHomePage.GetBuffer(ulLength), &ulLength);
		ATLASSERT(lRet == ERROR_SUCCESS);
		m_strHomePage.ReleaseBuffer();

		return (lRet == ERROR_SUCCESS);
	}

	void OpenPage(LPCTSTR lpstrURL)
	{
		CString strLoading;
		strLoading.LoadString(IDS_LOADING);

		pView = new CBrowserView;
		
		RECT rect;
		this->GetClientRect(&rect);

		pView->Create(m_hWnd, rect, lpstrURL, WS_CHILD | WS_VISIBLE | WS_CLIPSIBLINGS | WS_CLIPCHILDREN | WS_VSCROLL | WS_HSCROLL);
	
		CString strURL = lpstrURL;

		CComPtr<IWebBrowser2> spWebBrowser;
		HRESULT hRet = pView->QueryControl(IID_IWebBrowser2, (void**)&spWebBrowser);
	
		ATLASSERT(SUCCEEDED(hRet));

		ATLASSERT(spWebBrowser != NULL);
		hRet = spWebBrowser->Navigate(strURL.AllocSysString(), NULL, NULL, NULL, NULL);

		ATLASSERT(SUCCEEDED(hRet));

		pView->SetFocusToHTML();

	}



// Update UI map
	BEGIN_UPDATE_UI_MAP(CMainFrame)
		//UPDATE_ELEMENT(ID_WINDOW_CLOSE, UPDUI_TOOLBAR | UPDUI_MENUPOPUP)
		//UPDATE_ELEMENT(ID_WINDOW_CLOSE_ALL, UPDUI_TOOLBAR | UPDUI_MENUPOPUP)
	END_UPDATE_UI_MAP()

// Message map and handlers
	BEGIN_MSG_MAP(CMainFrame)
		MESSAGE_HANDLER(WM_CREATE, OnCreate)
		MESSAGE_HANDLER(WM_DESTROY, OnDestroy)
		MESSAGE_HANDLER(WM_SHOWWINDOW, OnShow)
		MESSAGE_HANDLER(WM_SIZE, OnSize)


		CHAIN_MSG_MAP(CUpdateUI<CMainFrame>)

		COMMAND_ID_HANDLER(ID_WINDOW_CLOSE, OnWindowClose)

		CHAIN_MSG_MAP(CFrameWindowImpl<CMainFrame>)
	END_MSG_MAP()

	LRESULT OnCreate(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/)
	{
		m_hWnd = ((CWindow*)this)->m_hWnd;

		ATLASSERT(::IsWindow(m_hWnd));

		SetMenu(NULL);

		CString strAddress;
		strAddress.LoadString(IDS_ADDRESS);
	
		// register object for message filtering and idle updates
		CMessageLoop* pLoop = _Module.GetMessageLoop();
		ATLASSERT(pLoop != NULL);
		pLoop->AddMessageFilter(this);
		pLoop->AddIdleHandler(this);


		bool bRet = GetHomePage();
		if(!bRet)
		{
			ATLTRACE(_T("TabBrowser: Can't get home page from the registry - using blank page\n"));
			m_strHomePage.LoadString(IDS_BLANK_URL);
		}

	
		return 0;
	}

	LRESULT OnDestroy(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& bHandled)
	{
		// unregister object for message filtering and idle updates
		CMessageLoop* pLoop = _Module.GetMessageLoop();
		ATLASSERT(pLoop != NULL);
		pLoop->RemoveMessageFilter(this);
		pLoop->RemoveIdleHandler(this);

		bHandled = FALSE;
		return 1;
	}
	

	LRESULT OnWindowClose(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/)
	{

		return 0;
	}

	LRESULT OnWindowCloseAll(WORD /*wNotifyCode*/, WORD /*wID*/, HWND /*hWndCtl*/, BOOL& /*bHandled*/)
	{
		return 0;
	}


	LRESULT OnSize(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/)
	{


		if (pView != NULL) {
			RECT rect;
			this->GetClientRect(&rect);

			pView->MoveWindow(&rect);
		}
		return 0;
	}



	LRESULT OnShow(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/)
	{
	
		//OpenPage(m_strHomePage);
		OpenPage(L"http://hudweb.fonality.com");
		return 0;
	}
};
