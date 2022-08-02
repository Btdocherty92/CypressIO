const headers = {
    "Authorization": `Bearer ${Cypress.config('token')}`,
    'Content-Type': 'application/json',
    'forrit-project-id': 'da4563e3-a447-4e9f-8556-42ba57f011cf'
}

function pollActivity(activityID) {
    cy.request({
        method: 'GET',
        url: `/Activities/${activityID}`,
        headers: headers
    })
    .then((response) => {
        let body = response.body
        
        expect(body).to.have.property('failure')
        if(body.failure !== 0)
            throw new Error(`Activity was not successful: ${body.failure}`)

        expect(body).to.have.property('processingStatus')
        if(body.processingStatus === 2)
            return

        pollActivity(activityID)
    })
}

const getAllBranches = () => {
    return cy.request({
        method: 'GET',
        url: '/Branches',
        headers: headers
    })
}

const getIdByName = () => {
    cy.request({
        method: 'GET',
        url: '/Branches',
        headers: headers
    }).its('body').then((body) => {
        let result = body.results.find(g => g.name === 'API-CY-Branch')
        console.log(`Result: ${result.id}`)
        branchId = result.id
    })
}

describe('Branches API', () => {

    it('GET All', () => {
        getAllBranches().as('branches')

        cy.get('@branches').should((response => {
            expect(response.body).to.have.property('results')
            const firstResponse = response.body.results[0]
            expect(firstResponse).to.have.property('created')
            //expect(firstResponse).to.have.property('createdByUserName').which.equals('Neil Cossar')
        }))
    })

    it('POST new', () => {
        // POST New
        cy.request({
            method: 'POST',
            url: '/Branches',
            headers: headers,
            body: {
                Name: 'API-CY-Branch'
            }
        }).as('branchesPost')
        //Poll activity
        cy.get('@branchesPost').should((response => {
            expect(response.body).to.have.property('id')
            let postID = response.body.id
            pollActivity(postID)
        }))    
    })

    it('GET by ID', () => {
        getAllBranches().its('body').then((body) => {
            let result = body.results.find(g => g.name === 'API-CY-Branch')
            
            cy.request({
                method: 'GET',
                url: `/Branches/${result.id}`,
                headers: headers
            }).as('branch')
    
            cy.get('@branch').should((response => {
                expect(response.body).to.have.property('name').which.equals('API-CY-Branch')
            }))
        })
    })

    it('DELETE by ID', () => {
        getAllBranches().its('body').then((body) => {
            let result = body.results.find(g => g.name === 'API-CY-Branch')

            cy.request({
                method: 'DELETE',
                url: `/Branches/${result.id}`,
                headers: headers
            }).as('branchDel')

            //Poll Activity
            cy.get('@branchDel').should((response => {
                expect(response.body).to.have.property('id')
                let delID = response.body.id
                pollActivity(delID)
            }))
        })
    })
})