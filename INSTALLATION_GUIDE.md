# Exchange WAF Installation Guide for IIS 10.0 and Exchange 2019

implementing the Exchange Web Application Firewall (WAF) on your IIS 10.0 server to protect your Exchange 2019 installation.

## Prerequisites

- Microsoft Exchange Server 2019
- IIS 10.0
- .NET 8.0 Runtime (https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server (or LocalDB for testing)
- URL Rewrite Module for IIS (https://www.iis.net/downloads/microsoft/url-rewrite)
- Application Request Routing (ARR) for IIS (https://www.iis.net/downloads/microsoft/application-request-routing)

## Step 1: Database Setup

1. Create a database named "ExchangeWAF" on your SQL Server instance.
2. Run the `Create_Database_Tables.sql` script to create all necessary tables.

## Step 2: Deploy the WAF Application to IIS

1. Create a new website or application in IIS:
   - Open IIS Manager
   - Right click on "Sites" and select "Add Website"
   - Set the name to "ExchangeWAF"
   - Set the physical path to the location of the published files (the `publish` folder)
   - Choose an available port (e.g., 7000) and create the website

2. Configure Application Pool:
   - Ensure the application pool is set to "No Managed Code" (since this is an ASP.NET Core app)
   - Set the .NET CLR version to "No Managed Code"
   - Set the Identity to a user with appropriate permissions

3. Install the ASP.NET Core Hosting Bundle:
   - Download from: https://dotnet.microsoft.com/download/dotnet/8.0
   - This includes the AspNetCoreModuleV2 required for hosting

## Step 3: Configure URL Rewrite Rules for Exchange

1. Install URL Rewrite Module for IIS if not already installed.
2. Install Application Request Routing (ARR) for IIS if not already installed.

3. Add the URL rewrite rules to Exchange's web.config:
   - Locate your Exchange Server's front end website in IIS
   - Import the `exchange_waf_rules.xml` file using the URL Rewrite UI in IIS
   
   OR
   
   - Manually add the following section to Exchange's web.config:
   
   ```xml
   <system.webServer>
     <rewrite>
       <rules>
         <rule name="ExchangeWAF_Login2FA" stopProcessing="true">
           <match url="^(fortinet/login2fa).*" />
           <action type="Rewrite" url="http://localhost:7000/waf/proxy/{R:0}" />
         </rule>
         <rule name="ExchangeWAF_OWA" stopProcessing="true">
           <match url="^(owa/auth).*" />
           <action type="Rewrite" url="http://localhost:7000/waf/proxy/{R:0}" />
         </rule>
         <rule name="ExchangeWAF_ECP" stopProcessing="true">
           <match url="^(ecp/auth).*" />
           <action type="Rewrite" url="http://localhost:7000/waf/proxy/{R:0}" />
         </rule>
       </rules>
     </rewrite>
   </system.webServer>
   ```

4. Enable Application Request Routing Proxy:
   - In IIS Manager, click on the server node
   - Open "Application Request Routing"
   - Click "Server Proxy Settings"
   - Check "Enable proxy" and click "Apply"

## Step 4: Configure the Connection String

1. Update the connection string in `appsettings.json` in the `publish` folder to point to your SQL Server:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Data Source=LSDEEP\\INSTANCE;Initial Catalog=ExchangeWAF;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
   }
   ```

## Step 5: Start the Services

1. Start the ExchangeWAF site in IIS:
   - In IIS Manager, right-click on the ExchangeWAF site and select "Start"
   
2. Restart the IIS service to apply changes:
   - Run Command Prompt as Administrator
   - Execute: `iisreset /restart`

## Step 6: Verify Installation

1. Access the Dashboard:
   - Open a browser and navigate to `http://localhost:7000/waf/dashboard`
   - You should see the ExchangeWAF dashboard with security statistics

2. Test the Protection:
   - Try accessing your Exchange OWA with a harmless XSS pattern in the URL or parameters
   - For example: `https://exchange-server/owa/auth?param=<script>alert(1)</script>`
   - You should be blocked and see it logged in the WAF dashboard

## Troubleshooting

1. Check IIS logs for any errors:
   - Located at `%SystemDrive%\inetpub\logs\LogFiles`

2. Check Event Viewer for ASP.NET Core issues:
   - Windows Logs > Application

3. Enable stdout logging in web.config:
   - Edit the `web.config` in the publish folder
   - Change `stdoutLogEnabled="false"` to `stdoutLogEnabled="true"`
   - This will create logs in the `logs` folder

All Right Reserved to Mustafa Hussein - https://github.com/cyb3rhex 


