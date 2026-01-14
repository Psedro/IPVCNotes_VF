import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '250px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'none' }}><Header /></div> {/* Hiding original header to avoid duplication if we want custom header per page or integrated. Wait, let's keep Header for user profile actions but maybe style it differently or just place it in content area. 
                Actually, let's render Header inside the main area for now, or assume pages invoke Header themselves.
                However, looking at Dashboard, it invokes Header. So if I wrap Dashboard in Layout, I'll have Sidebar + Dashboard(Header+Main).
                That works. 
                But I must ensure sidebar doesn't overlap. 'marginLeft: 250px' handles that.
                */}
                {children}
            </div>
        </div>
    );
}
