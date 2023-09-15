export type ReportIssueDto =
    {
        open_on_behalf_of_this_user: string,
        which_photon_appication_are_you_reporting_issue_on: string,
        please_select_your_issue_from_the_following_options1: string,
        browser: string,
        browser_versions?: number, 
        briefly_describe_the_issue: string
    };