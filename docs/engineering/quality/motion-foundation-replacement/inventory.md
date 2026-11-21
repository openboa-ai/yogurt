# Component replacement inventory

Each entry is pending until its normal package export, guide, registry and supported renderer have been replaced and verified. A specimen is a starting point for its geometry and behavior.

The Web behavior runtime transition is in progress. Button, Checkbox, RadioGroup, Switch, TextField, SearchField, Textarea, SegmentedControl, Tabs, Toggle, ToggleGroup, Dialog, Sheet, Drawer, Popover, Accordion, Progress, SplitTextField and Rating have Web implementation and installed-consumer evidence in their scoped control records. Their overall state remains pending until the corresponding registry and Native behavior, visual treatment and motion are qualified. Remaining entries have not been admitted as converted merely because their gallery tests pass.

ActionMenu has a partial Web transition: shared inline popup and button behaviors with a Yogurt keyboard adapter. Tooltip has shared inline popup state with a Yogurt activation adapter. InputOTP has shared input behavior with an explicit secret mark and retains its Yogurt numeric and cursor adapter. NumericSpinner uses shared buttons with the existing Yogurt quantity adapter. InputGroup uses shared input behavior for compatible text fields and retains a native input adapter for specialized types. Their complete shared behaviors and other renderers remain pending.

## Observed Web progress

A 2026-11-21 worktree snapshot passed the catalog gallery smoke check for **125 components and 14 blocks** across four browser/theme/viewport combinations (556 renders). It checked that examples rendered without page errors, page-level horizontal overflow or gallery alignment failures. This is not a design, motion, accessibility or product-use approval for every state. The snapshot was not recorded as an immutable revision; changes after it require rechecking.

Of the 125 component IDs, **33** have the additional, explicitly linked focused Web checks below, and **92** have only the catalog-wide smoke observation in this conservative count. A focused check proves only the cases its file exercises; it does not establish complete design or motion quality, all Web hosts, accessibility or Native parity. Some components may have additional evidence not counted here until it is linked. The `Web observation` column labels these two evidence levels rather than completion. All 125 remain `Pending` for the full replacement criteria, including supported Native behavior and visual review.

| Components | Focused Web evidence |
| --- | --- |
| `button` | [web-button-sizes.cjs](../../../../checks/web-button-sizes.cjs) |
| `text-field`, `input-group`, `search-field`, `select` | [web-field-sizes.cjs](../../../../checks/web-field-sizes.cjs) |
| `combobox` | [web-combobox-form.cjs](../../../../checks/web-combobox-form.cjs) |
| `card` | [web-card-density.cjs](../../../../checks/web-card-density.cjs) |
| `slider` | [web-slider-foundation.cjs](../../../../checks/web-slider-foundation.cjs) |
| `checkbox` | [web-checkbox-foundation.cjs](../../../../checks/web-checkbox-foundation.cjs) |
| `rating` | [web-rating-foundation.cjs](../../../../checks/web-rating-foundation.cjs) |
| `numeric-spinner` | [web-spinner-width.cjs](../../../../checks/web-spinner-width.cjs) |
| `list-row` | [web-list-foundation.cjs](../../../../checks/web-list-foundation.cjs) |
| `avatar`, `attachment` | [web-avatar-foundation.cjs](../../../../checks/web-avatar-foundation.cjs) |
| `post`, `bar-chart` | [web-text-data-foundation.cjs](../../../../checks/web-text-data-foundation.cjs) |
| `accordion` | [web-attachment-foundation.cjs](../../../../checks/web-attachment-foundation.cjs) |
| `pagination` | [web-pagination-motion.cjs](../../../../checks/web-pagination-motion.cjs) |
| `calendar`, `date-picker` | [web-calendar-foundation.cjs](../../../../checks/web-calendar-foundation.cjs) |
| `keypad` | [web-keypad-foundation.cjs](../../../../checks/web-keypad-foundation.cjs) |
| `tooltip` | [web-tooltip-motion.cjs](../../../../checks/web-tooltip-motion.cjs) |
| `composer` | [web-composer-foundation.cjs](../../../../checks/web-composer-foundation.cjs) |
| `toast-stack` | [web-toast-exit.cjs](../../../../checks/web-toast-exit.cjs) |
| `top` | [web-top-spacing.cjs](../../../../checks/web-top-spacing.cjs) |
| `disclosure-row`, `skeleton` | [web-disclosure-motion.cjs](../../../../checks/web-disclosure-motion.cjs) |
| `sidebar`, `sidebar-layout` | [web-sidebar-motion-feedback.cjs](../../../../checks/web-sidebar-motion-feedback.cjs) |
| `chart` | [web-chart-foundation.cjs](../../../../checks/web-chart-foundation.cjs) |
| `textarea` | [web-ghost-textarea.cjs](../../../../checks/web-ghost-textarea.cjs) |
| `segmented-control` | [web-segmented.cjs](../../../../checks/web-segmented.cjs) |
| `action-menu` | [web-action-menu.cjs](../../../../checks/web-action-menu.cjs) |

| Component | Family | Yogurt specimen | Web observation | State |
| --- | --- | --- | --- | --- |
| `yogurt` | foundation | Family design | Smoke | Pending |
| `text` | foundation | Family design | Smoke | Pending |
| `heading` | foundation | Family design | Smoke | Pending |
| `icon` | foundation | Family design | Smoke | Pending |
| `stack` | foundation | Family design | Smoke | Pending |
| `inline` | foundation | Family design | Smoke | Pending |
| `grid` | foundation | Family design | Smoke | Pending |
| `surface` | foundation | Family design | Smoke | Pending |
| `divider` | foundation | Family design | Smoke | Pending |
| `scroll-area` | foundation | Family design | Smoke | Pending |
| `button` | action | `copy-button`, `loading-to-success`, `hold-button`, `cart-button` | Focused | Pending |
| `icon-button` | action | `copy-button`, `morph-tooltip` | Smoke | Pending |
| `button-group` | action | Family design | Smoke | Pending |
| `bottom-action` | action | Family design | Smoke | Pending |
| `field` | input | Family design | Smoke | Pending |
| `label` | input | Family design | Smoke | Pending |
| `help-text` | input | Family design | Smoke | Pending |
| `field-error` | input | Family design | Smoke | Pending |
| `text-field` | input | `spring-input`, `ghost-suggestion` | Focused | Pending |
| `search-field` | input | Family design | Focused | Pending |
| `textarea` | input | `letter-limit`, `mention-picker` | Focused | Pending |
| `select` | input | `spring-dropdown` | Focused | Pending |
| `combobox` | input | Family design | Focused | Pending |
| `checkbox` | input | `checkbox-list` | Focused | Pending |
| `radio-group` | input | Family design | Smoke | Pending |
| `switch` | input | `toggle-switch`, `focus-mode` | Smoke | Pending |
| `link` | navigation | Family design | Smoke | Pending |
| `breadcrumb` | navigation | Family design | Smoke | Pending |
| `navigation-list` | navigation | Family design | Smoke | Pending |
| `tabs` | navigation | `tab-pill`, `smooth-tabs`, `bottom-bar` | Smoke | Pending |
| `segmented-control` | navigation | `segmented-control`, `plan-switch` | Focused | Pending |
| `pagination` | navigation | Family design | Focused | Pending |
| `disclosure-row` | layer | Family design | Focused | Pending |
| `action-menu` | layer | `dynamic-menu` | Focused | Pending |
| `popover` | layer | Family design | Smoke | Pending |
| `dialog` | layer | Family design | Smoke | Pending |
| `drawer` | layer | Family design | Smoke | Pending |
| `sheet` | layer | Family design | Smoke | Pending |
| `tooltip` | layer | `morph-tooltip` | Focused | Pending |
| `filter-bar` | collection | Family design | Smoke | Pending |
| `count` | collection | Family design | Smoke | Pending |
| `list` | collection | Family design | Smoke | Pending |
| `list-row` | collection | Family design | Focused | Pending |
| `selection-list` | collection | Family design | Smoke | Pending |
| `empty-result` | collection | Family design | Smoke | Pending |
| `badge` | feedback | Family design | Smoke | Pending |
| `status` | feedback | Family design | Smoke | Pending |
| `notice` | feedback | Family design | Smoke | Pending |
| `skeleton` | feedback | Family design | Focused | Pending |
| `progress` | feedback | `step-progress`, `storage-meter` | Smoke | Pending |
| `toast` | feedback | Family design | Smoke | Pending |
| `result` | feedback | Family design | Smoke | Pending |
| `record-facts` | data | Family design | Smoke | Pending |
| `table` | data | Family design | Smoke | Pending |
| `data-table` | data | Family design | Smoke | Pending |
| `chart` | data | Family design | Focused | Pending |
| `legend` | data | Family design | Smoke | Pending |
| `confirm-dialog` | decision | Family design | Smoke | Pending |
| `receipt` | decision | Family design | Smoke | Pending |
| `project-mark` | conversation | Family design | Smoke | Pending |
| `agent-avatar` | conversation | Family design | Smoke | Pending |
| `gaze` | conversation | Family design | Smoke | Pending |
| `message` | conversation | Family design | Smoke | Pending |
| `activity` | conversation | Family design | Smoke | Pending |
| `transcript` | conversation | Family design | Smoke | Pending |
| `reading-anchor` | conversation | Family design | Smoke | Pending |
| `aspect-ratio` | foundation | Family design | Smoke | Pending |
| `direction` | foundation | Family design | Smoke | Pending |
| `card` | foundation | `expand-card`, `profile-card`, `stat-card` | Focused | Pending |
| `asset` | foundation | Family design | Smoke | Pending |
| `gradient` | foundation | Family design | Smoke | Pending |
| `elevation` | foundation | Family design | Smoke | Pending |
| `kbd` | foundation | Family design | Smoke | Pending |
| `post` | foundation | Family design | Focused | Pending |
| `grid-list` | collection | Family design | Smoke | Pending |
| `list-header` | collection | Family design | Smoke | Pending |
| `list-footer` | collection | Family design | Smoke | Pending |
| `top` | collection | Family design | Focused | Pending |
| `bottom-info` | feedback | Family design | Smoke | Pending |
| `highlight` | feedback | Family design | Smoke | Pending |
| `spinner` | feedback | Family design | Smoke | Pending |
| `toast-stack` | feedback | `notifications` | Focused | Pending |
| `table-row` | data | Family design | Smoke | Pending |
| `amount-top` | data | Family design | Smoke | Pending |
| `bar-chart` | data | Family design | Focused | Pending |
| `avatar` | conversation | Family design | Focused | Pending |
| `bubble` | conversation | Family design | Smoke | Pending |
| `attachment` | conversation | Family design | Focused | Pending |
| `marker` | conversation | Family design | Smoke | Pending |
| `code-block` | conversation | Family design | Smoke | Pending |
| `trace` | conversation | Family design | Smoke | Pending |
| `input-group` | input | `spring-input` | Focused | Pending |
| `input-otp` | input | `otp` | Smoke | Pending |
| `split-text-field` | input | Family design | Smoke | Pending |
| `slider` | input | `range-slider`, `elastic-slider` | Focused | Pending |
| `numeric-spinner` | input | `cart-button` | Focused | Pending |
| `rating` | input | `star-rating` | Focused | Pending |
| `agreement` | input | Family design | Smoke | Pending |
| `keypad` | input | Family design | Focused | Pending |
| `form` | input | Family design | Smoke | Pending |
| `toggle` | action | Family design | Smoke | Pending |
| `toggle-group` | action | Family design | Smoke | Pending |
| `accordion` | layer | Family design | Focused | Pending |
| `context-menu` | layer | Family design | Smoke | Pending |
| `hover-card` | layer | Family design | Smoke | Pending |
| `command` | layer | `command-palette`, `command-button` | Smoke | Pending |
| `menubar` | navigation | Family design | Smoke | Pending |
| `navigation-menu` | navigation | Family design | Smoke | Pending |
| `sidebar` | navigation | Family design | Focused | Pending |
| `navbar` | navigation | Family design | Smoke | Pending |
| `carousel` | navigation | Family design | Smoke | Pending |
| `stepper` | navigation | `step-progress`, `agent-steps` | Smoke | Pending |
| `resizable` | foundation | Family design | Smoke | Pending |
| `calendar` | input | Family design | Focused | Pending |
| `date-picker` | input | Family design | Focused | Pending |
| `questionnaire` | input | Family design | Smoke | Pending |
| `agent-row` | workspace | Family design | Smoke | Pending |
| `runtime-panel` | workspace | Family design | Smoke | Pending |
| `resource-row` | workspace | Family design | Smoke | Pending |
| `thread-row` | workspace | Family design | Smoke | Pending |
| `work-event` | workspace | Family design | Smoke | Pending |
| `routine-row` | workspace | Family design | Smoke | Pending |
| `composer` | workspace | `prompt-box` | Focused | Pending |
| `voice-control` | workspace | Family design | Smoke | Pending |
| `sidebar-layout` | navigation | `sidebar-collapse` | Focused | Pending |
