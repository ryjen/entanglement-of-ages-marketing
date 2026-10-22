const { test, expect } = require('@playwright/test');
const base=process.env.SITE_BASE_URL||'http://127.0.0.1:4173/';
const url=new URL('beta/editors/',base).href;
test('beta signup is visibly closed and cannot submit email',async({page})=>{
 const submissions=[];
 page.on('request',req=>{if(req.method()!=='GET')submissions.push(req.url());});
 await page.goto(url);
 await expect(page.getByRole('heading',{name:'Beta editors and early readers.'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Registration opening later'})).toBeVisible();
 expect(await page.locator('form,input,button').count()).toBe(0);
 expect(submissions).toEqual([]);
});
for(const v of [{name:'mobile',width:375,height:812},{name:'desktop',width:1440,height:900}]){
 test(v.name+' beta info remains accessible',async({page})=>{
  await page.setViewportSize(v);
  await page.goto(url);
  await expect(page.getByRole('heading',{name:'Beta editors and early readers.'})).toBeVisible();
  await expect(page.getByRole('link',{name:'info@ryanjennin.gs'})).toHaveAttribute('href','mailto:info@ryanjennin.gs');
  await page.getByRole('link',{name:'Explore the four novels'}).focus();
  await expect(page.getByRole('link',{name:'Explore the four novels'})).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
 });
}
