# Online Exam testing — bugs 6 to 43

Bugs 1–5 are out of scope. Each case is a manual check against the running app.

| Bug | Steps | Expected |
| --- | --- | --- |
| 6 | Open any dashboard top bar | The bell is a notification icon. The badge is the unread count, not a fixed 3. |
| 7 | Suspend an organization, then reactivate it | Suspend sets teachers and students to suspended. Reactivate sets pending and suspended members back to active. The Actions column heading is centered. |
| 8 | Open admin reviews / reports score bars | Correct answers use a green horizontal bar. Incorrect answers use a red horizontal bar. |
| 9, 17 | Open `/verify-certificate` and verify a valid code | The logo does not cover the form. A certificate card shows the student, test, score, and certificate number. |
| 10, 14 | Open admin flagged attempts and expand a row | The page loads. The column heading is Status. There is no Close button on the timeline. |
| 12 | Open an exam result | Neither the top nor the bottom of the page has a Back to Results button. |
| 16 | Open admin audit logs | Create, Update, and Delete filters are available. |
| 18 | Open test builder | There is no Back to Tests button. |
| 19 | Fill create-test details, leave the page, and return to Exam Details | The draft details are restored. |
| 20, 26 | Submit an exam, then open notifications and the audit log | The sidebar no longer shows a fake count of 3. Submit writes an activity log and an audit row (submit or auto_submit). Read all marks unread notifications as read. |
| 23, 24, 27 | In the question bank, submit an invalid question. In test builder, select questions, leave, and return. | Validation runs after submit. There is no Create Exam button. Selected question ids stay selected for that test. |
| 25 | From the landing page, open About, Contact, FAQ, Instructor Login, Become a Teacher, a popular exam, WhatsApp, the email address, the store badges, and each social icon | About and Contact open at the top of the page. Instructor Login and Become a Teacher are separate lines and open `/login?as=instructor` and `/login?as=teacher` with different headings. Asked Questions goes to FAQ. Exam links match their category. WhatsApp, mail, Play, App Store, X, Facebook, Instagram, and LinkedIn open the matching destination. |
| 28, 37 | On admin certificates and student certificates, download one row | Only that certificate’s PDF downloads. The certificates page has no Certificate Preview. |
| 29 | Open admin payments when one payment is pending | The Pending card and the Pending filter show 1, not a rupee amount of 0. |
| 32 | Open the student dashboard after scored attempts | The performance chart uses those scores. |
| 33 | Open the student welcome title | There is no clap emoji. |
| 36 | Open student messages with a mix of read and unread rows | Read all is available. A read row shows Read, not a dash. |
| 38 | Open an exam result | Verify Certificate, practice recommendations, and the hidden-answer block are gone. Each question shows Your answer. The correct answer is highlighted when the key is released. |
| 39 | Open Assignments, then My Tests | Assignments shows schedule and status and links to My Tests. My Tests is where Start and Resume happen. |
| 42 | Start an exam in fullscreen and press Submit Test. Press Print Screen. | The confirm dialog is visible and submit completes. A screenshot attempt is logged. |

Screenshot-only items 11, 13, 15, 21, 22, 30, 31, 35, 40, 41, and 43 need the original page image before a further visual change. Sidebar, alerts, and student settings already use the shared dashboard theme.

Automated: `npm test` in `eduOs_api` covers organization suspend and reactivate member status (`orgMemberStatusSync`).
