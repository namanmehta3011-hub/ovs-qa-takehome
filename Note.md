# Assignment Submission Tests

Automated tests for the Assignment Submission feature (Scenario A), written 
in Playwright with TypeScript.

I chose Playwright/TypeScript because it matches the automation framework work I'm 
currently doing, and TypeScript's type safety helps catch mistakes early. It is useful 
since I didn't have access to a live system to test against. I targeted the core 
upload flow: a valid submission, an oversized file, and an unsupported file type, 
using realistic assumed selectors (documented as comments in the code) since the 
real LMS wasn't available. With more time, I'd add a resubmission test and verify 
assumptions against the actual DOM structure.   # ovs-qa-takehome
