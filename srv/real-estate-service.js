const cds = require('@sap/cds');
const { ref } = cds.ql;
const { v4: uuidv4 } = require('uuid');

module.exports = cds.service.impl(async function () {

  const
    {
      Projects,
      Units,
      Buildings,
      PaymentPlans,
      PaymentPlanSchedules,
      PaymentPlanProjects,
      Measurements,
      Conditions,
      EOI,
      PaymentDetails,
      Reservations,
      ReservationPartners,
      ReservationConditions,
      ReservationPayments,
      ConditionTypes,
      BasePrices,
      CalculationMethods,
      Frequencies,
      PaymentPlanSimulations,
      PaymentPlanSimulationSchedules,
      RealEstateContracts
    } = this.entities;


  /*-----------------------Buildings---------------------------*/
  // READ
  this.on('READ', Buildings, async (req) => {
    console.log('READ Buildings called');
    const db = cds.transaction(req);
    return await db.run(req.query);
  });
  // CREATE
  this.on('CREATE', Buildings, async (req) => {
    console.log('CREATE Buildings called with data:', req.data);
    const db = cds.transaction(req);
    return await db.run(
      INSERT.into(Buildings).entries(req.data)
    );
  });

  // UPDATE
  this.on('UPDATE', Buildings, async (req) => {
    try {
      const { buildingId } = req.data;

      // Log the request
      console.log(`Updating Building ID: ${buildingId}`);
      console.log('Payload:', req.data);

      // Optional: validate data
      if (!req.data.buildingDescription) {
        return req.reject(400, 'Building description is required.');
      }

      // Perform the actual update
      const result = await UPDATE(Buildings)
        .set(req.data)
        .where({ buildingId });

      if (result === 0) {
        return req.reject(404, `Building with ID ${buildingId} not found.`);
      }

      // Return updated record
      const updatedRecord = await SELECT.one.from(Buildings).where({ buildingId });
      return updatedRecord;
    } catch (error) {
      console.error('Error in UPDATE handler:', error);
      req.reject(500, error.message);
    }
  });
  //DELETE
  this.on('DELETE', Buildings, async (req) => {
    console.log('DELETE Building called for buildingId:', req.data.buildingId);
    const db = cds.transaction(req);
    try {
      return await db.run(
        DELETE.from(Buildings).where({ buildingId: req.data.buildingId })
      );
    } catch (error) {
      console.error('Error deleting Building :', error);
      req.error(500, 'Error deleting Building: ' + error.message);
    }
  });



  /*-----------------------Projects---------------------------*/

  // READ
  this.on('READ', Projects, async (req) => {
    console.log('READ Projects called');
    const db = cds.transaction(req);
    return await db.run(req.query);   // execute the query as requested
  });

  // CREATE
  this.on('CREATE', Projects, async (req) => {
    console.log('CREATE Project called with data:', req.data);
    const db = cds.transaction(req);
    try {
      return await db.run(
        INSERT.into(Projects).entries(req.data)
      );
    }
    catch (error) {
      console.error('Error creating Project:', error);
      req.error(500, 'Error creating Project');
    }
  });

  // UPDATE
  this.on('UPDATE', Projects, async (req) => {
    console.log("UPDATE Project called with:", req.data, "params:", req.params);

    const { projectId } = req.params[0];   // <-- get key from URL
    const db = cds.transaction(req);

    try {
      await db.run(
        UPDATE(Projects)
          .set(req.data)
          .where({ projectId })
      );

      // Return the updated record
      const updated = await db.run(SELECT.one.from(Projects).where({ projectId }));
      return updated;
    } catch (error) {
      console.error("Error updating Project:", error);
      req.error(500, "Error updating Project: " + error.message);
    }
  });


  // DELETE
  this.on('DELETE', Projects, async (req) => {
    console.log('DELETE Project called for projectId:', req.data.projectId);
    const db = cds.transaction(req);
    return await db.run(
      DELETE.from(Projects).where({ projectId: req.data.projectId })
    );
  });


  /*-----------------------Units---------------------------*/

  // READ
  this.on('READ', Units, async (req) => {
    console.log('READ Units called');
    const db = cds.transaction(req);
    return await db.run(req.query);
  });

  // CREATE for Units (fixed)
  this.on('CREATE', Units, async (req) => {
    console.log('CREATE Unit called with data:', req.data);
    const db = cds.transaction(req);

    await db.run(INSERT.into(Units).entries(req.data));

    // Fetch the full record with associations (fixed syntax)
    const createdUnit = await db.run(
      SELECT.one.from(Units)
        .where({ unitId: req.data.unitId })
        .columns(
          '*',
          { ref: ['measurements'], expand: ['*'] },
          { ref: ['conditions'], expand: ['*'] }
        )
    );

    console.log('Created Unit returned to UI:', createdUnit);
    return createdUnit;
  });


  // UPDATE 
  this.on('UPDATE', Units, async (req) => {
    console.log('UPDATE Unit called with:', req.data, 'params:', req.params);

    const { unitId } = req.params[0];
    const db = cds.transaction(req);

    try {
      await db.run(
        UPDATE(Units)
          .set(req.data)
          .where({ unitId })
      );

      const updated = await db.run(SELECT.one.from(Units).where({ unitId }));
      return updated;
    } catch (error) {
      console.error('Error updating Unit:', error);
      req.error(500, 'Error updating Unit: ' + error.message);
    }
  });

  // DELETE  
  this.on('DELETE', Units, async (req) => {
    console.log('DELETE Unit called for unitId:', req.data.unitId);
    const db = cds.transaction(req);
    try {
      return await db.run(
        DELETE.from(Units).where({ unitId: req.data.unitId })
      );
    } catch (error) {
      console.error('Error deleting Unit:', error);
      req.error(500, 'Error deleting Unit: ' + error.message);
    }
  });

  /*----------------------- Measurements ---------------------------*/

  // READ
  this.on('READ', Measurements, async (req) => {
    console.log('READ Measurements called');
    const db = cds.transaction(req);
    return await db.run(req.query);
  });

  // CREATE
  this.on('CREATE', Measurements, async (req) => {
    console.log('CREATE Measurement called with data:', req.data);
    const db = cds.transaction(req);
    try {
      const data = req.data;
      data.ID = cds.utils.uuid(); // ensure unique ID

      // handle association to Unit (if frontend passes nested or flat)
      if (req.data.unit_unitId) {
        data.unit_unitId = req.data.unit_unitId;
      } else if (req.data.unit) {
        data.unit_unitId = req.data.unit.unitId || req.data.unit.ID;
      }

      return await db.run(INSERT.into(Measurements).entries(data));
    } catch (error) {
      console.error('Error creating Measurement:', error);
      req.error(500, 'Error creating Measurement');
    }
  });

  // UPDATE
  this.on('UPDATE', Measurements, async (req) => {
    console.log('UPDATE Measurement called with:', req.data, 'params:', req.params);

    const { ID } = req.params[0];
    const db = cds.transaction(req);

    try {
      await db.run(UPDATE(Measurements).set(req.data).where({ ID }));
      const updated = await db.run(SELECT.one.from(Measurements).where({ ID }));
      return updated;
    } catch (error) {
      console.error('Error updating Measurement:', error);
      req.error(500, 'Error updating Measurement: ' + error.message);
    }
  });

  // DELETE
  this.on('DELETE', Measurements, async (req) => {
    console.log('DELETE Measurement called for ID:', req.data.ID);
    const db = cds.transaction(req);
    try {
      return await db.run(DELETE.from(Measurements).where({ ID: req.data.ID }));
    } catch (error) {
      console.error('Error deleting Measurement:', error);
      req.error(500, 'Error deleting Measurement: ' + error.message);
    }
  });


  /*----------------------- Conditions ---------------------------*/

  // READ
  this.on('READ', Conditions, async (req) => {
    console.log('READ Conditions called');
    const db = cds.transaction(req);
    return await db.run(req.query);
  });

  // CREATE
  this.on('CREATE', Conditions, async (req) => {
    console.log('CREATE Condition called with data:', req.data);
    const db = cds.transaction(req);
    try {
      const data = req.data;
      data.ID = cds.utils.uuid(); // ensure unique ID

      // handle association to Unit (if frontend passes nested or flat)
      if (req.data.unit_unitId) {
        data.unit_unitId = req.data.unit_unitId;
      } else if (req.data.unit) {
        data.unit_unitId = req.data.unit.unitId || req.data.unit.ID;
      }

      return await db.run(INSERT.into(Conditions).entries(data));
    } catch (error) {
      console.error('Error creating Condition:', error);
      req.error(500, 'Error creating Condition');
    }
  });

  // UPDATE
  this.on('UPDATE', Conditions, async (req) => {
    console.log('UPDATE Condition called with:', req.data, 'params:', req.params);

    const { ID } = req.params[0];
    const db = cds.transaction(req);

    try {
      await db.run(UPDATE(Conditions).set(req.data).where({ ID }));
      const updated = await db.run(SELECT.one.from(Conditions).where({ ID }));
      return updated;
    } catch (error) {
      console.error('Error updating Condition:', error);
      req.error(500, 'Error updating Condition: ' + error.message);
    }
  });

  // DELETE
  this.on('DELETE', Conditions, async (req) => {
    console.log('DELETE Condition called for ID:', req.data.ID);
    const db = cds.transaction(req);
    try {
      return await db.run(DELETE.from(Conditions).where({ ID: req.data.ID }));
    } catch (error) {
      console.error('Error deleting Condition:', error);
      req.error(500, 'Error deleting Condition: ' + error.message);
    }
  });

  /* ------------------------------------------------------------------
  * PAYMENT PLANS
  * ------------------------------------------------------------------ */

  // READ
  this.on('READ', PaymentPlans, async (req, next) => {
    console.log('READ PaymentPlans called with expand:', req.query.$expand);
    try {
      const result = await next();
      return result;
    } catch (error) {
      console.error('Error reading PaymentPlans:', error);
      req.error(500, 'Error reading PaymentPlans: ' + error.message);
    }
  });

  // CREATE

  // CREATE
  this.on('CREATE', PaymentPlans, async (req) => {
    console.log('CREATE PaymentPlan called with data:', req.data);
    const db = cds.transaction(req);

    try {
      const { schedule, assignedProjects, ...planData } = req.data;
      planData.paymentPlanId = planData.paymentPlanId || uuidv4();

      // ✅ UPDATED: Validate total percentage in schedule (exclude Maintenance)
      if (Array.isArray(schedule)) {
        // Fetch descriptions for condition types to identify Maintenance
        const conditionCodes = schedule.map(s => s.conditionType_code).filter(code => code);
        const conditionTypes = await db.run(
          SELECT.from(ConditionTypes).where({ code: conditionCodes })
        );
        const codeToDescription = {};
        conditionTypes.forEach(ct => {
          codeToDescription[ct.code] = ct.description;
        });

        // Sum only non-Maintenance percentages
        const totalPercentage = schedule.reduce((sum, s) => {
          const description = codeToDescription[s.conditionType_code];
          if (description !== "Maintenance") {
            return sum + (parseFloat(s.percentage) || 0);
          }
          return sum;
        }, 0);
        if (totalPercentage !== 100) {
          req.error(400, `Total percentage of non-Maintenance schedule items must be exactly 100. Current total: ${totalPercentage}`);
          return;  // Stop processing
        }
      } else if (!schedule || schedule.length === 0) {
        req.error(400, 'At least one schedule item is required, and total percentage must be 100.');
        return;
      }

      // Insert main Payment Plan
      await db.run(INSERT.into(PaymentPlans).entries(planData));

      // Insert Schedules (if any)
      if (Array.isArray(schedule)) {
        for (const s of schedule) {
          await db.run(
            INSERT.into(PaymentPlanSchedules).entries({
              ID: s.ID || uuidv4(),
              paymentPlan_paymentPlanId: planData.paymentPlanId,
              conditionType_code: s.conditionType_code,
              basePrice_code: s.basePrice_code,
              calculationMethod_code: s.calculationMethod_code,
              frequency_code: s.frequency_code,
              percentage: s.percentage,
              dueInMonth: s.dueInMonth,
              numberOfInstallments: s.numberOfInstallments,
              numberOfYears: s.numberOfYears
            })
          );
        }
      }

      // Insert Assigned Projects (if any)
      if (Array.isArray(assignedProjects)) {
        for (const p of assignedProjects) {
          await db.run(
            INSERT.into(PaymentPlanProjects).entries({
              ID: p.ID || uuidv4(),
              paymentPlan_paymentPlanId: planData.paymentPlanId,
              project_projectId: p.project_projectId
            })
          );
        }
      }

      await db.commit();
      console.log('✅ PaymentPlan created successfully:', planData.paymentPlanId);
      return planData;

    } catch (error) {
      await db.rollback();
      console.error('❌ Error creating PaymentPlan:', error);
      req.error(500, 'Error creating PaymentPlan: ' + error.message);
    }
  });


  // UPDATE
this.on('UPDATE', PaymentPlans, async (req) => {
    console.log("UPDATE PaymentPlan called with:", req.data);
    const { paymentPlanId } = req.params[0];
    const db = cds.transaction(req);

    try {
      const { schedule, assignedProjects, ...planData } = req.data;

      // ✅ UPDATED: Validate total percentage in schedule (exclude Maintenance)
      if (Array.isArray(schedule)) {
        // Fetch descriptions for condition types to identify Maintenance
        const conditionCodes = schedule.map(s => s.conditionType_code).filter(code => code);
        const conditionTypes = await db.run(
          SELECT.from(ConditionTypes).where({ code: conditionCodes })
        );
        const codeToDescription = {};
        conditionTypes.forEach(ct => {
          codeToDescription[ct.code] = ct.description;
        });

        // Sum only non-Maintenance percentages
        const totalPercentage = schedule.reduce((sum, s) => {
          const description = codeToDescription[s.conditionType_code];
          if (description !== "Maintenance") {
            return sum + (parseFloat(s.percentage) || 0);
          }
          return sum;
        }, 0);
        if (totalPercentage !== 100) {
          req.error(400, `Total percentage of non-Maintenance schedule items must be exactly 100. Current total: ${totalPercentage}`);
          return;  // Stop processing
        }
      } else if (!schedule || schedule.length === 0) {
        req.error(400, 'At least one schedule item is required, and total percentage must be 100.');
        return;
      }

      // Update main record
      await db.run(
        UPDATE(PaymentPlans).set(planData).where({ paymentPlanId })
      );

      // Refresh schedule items
      await db.run(DELETE.from(PaymentPlanSchedules).where({ paymentPlan_paymentPlanId: paymentPlanId }));
      if (Array.isArray(schedule)) {
        for (const s of schedule) {
          await db.run(
            INSERT.into(PaymentPlanSchedules).entries({
              ID: s.ID || uuidv4(),
              paymentPlan_paymentPlanId: paymentPlanId,
              conditionType_code: s.conditionType_code,
              basePrice_code: s.basePrice_code,
              calculationMethod_code: s.calculationMethod_code,
              frequency_code: s.frequency_code,
              percentage: s.percentage,
              dueInMonth: s.dueInMonth,
              numberOfInstallments: s.numberOfInstallments,
              numberOfYears: s.numberOfYears
            })
          );
        }
      }

      // Refresh assigned projects
      await db.run(DELETE.from(PaymentPlanProjects).where({ paymentPlan_paymentPlanId: paymentPlanId }));
      if (Array.isArray(assignedProjects)) {
        for (const p of assignedProjects) {
          await db.run(
            INSERT.into(PaymentPlanProjects).entries({
              ID: p.ID || uuidv4(),
              paymentPlan_paymentPlanId: paymentPlanId,
              project_projectId: p.project_projectId
            })
          );
        }
      }

      const updated = await db.run(SELECT.one.from(PaymentPlans).where({ paymentPlanId }));
      await db.commit();
      console.log("✅ PaymentPlan updated:", paymentPlanId);
      return updated;

    } catch (error) {
      await db.rollback();
      console.error("❌ Error updating PaymentPlan:", error);
      req.error(500, "Error updating PaymentPlan: " + error.message);
    }
  });
  // // UPDATE
  // this.on('UPDATE', PaymentPlans, async (req) => {
  //   console.log("UPDATE PaymentPlan called with:", req.data);
  //   const { paymentPlanId } = req.params[0];
  //   const db = cds.transaction(req);

  //   try {
  //     const { schedule, assignedProjects, ...planData } = req.data;

  //     // Update main record
  //     await db.run(
  //       UPDATE(PaymentPlans).set(planData).where({ paymentPlanId })
  //     );

  //     // Refresh schedule items
  //     await db.run(DELETE.from(PaymentPlanSchedules).where({ paymentPlan_paymentPlanId: paymentPlanId }));
  //     if (Array.isArray(schedule)) {
  //       for (const s of schedule) {
  //         await db.run(
  //           INSERT.into(PaymentPlanSchedules).entries({
  //             ID: s.ID || uuidv4(),
  //             paymentPlan_paymentPlanId: paymentPlanId,
  //             conditionType_code: s.conditionType_code,  // ✅ Fixed: Access flat key directly
  //             basePrice_code: s.basePrice_code,          // ✅ Fixed
  //             calculationMethod_code: s.calculationMethod_code,  // ✅ Fixed
  //             frequency_code: s.frequency_code,          // ✅ Fixed
  //             percentage: s.percentage,
  //             dueInMonth: s.dueInMonth,
  //             numberOfInstallments: s.numberOfInstallments,
  //             numberOfYears: s.numberOfYears
  //           })
  //         );
  //       }
  //     }

  //     // Refresh assigned projects - Already correct
  //     await db.run(DELETE.from(PaymentPlanProjects).where({ paymentPlan_paymentPlanId: paymentPlanId }));
  //     if (Array.isArray(assignedProjects)) {
  //       for (const p of assignedProjects) {
  //         await db.run(
  //           INSERT.into(PaymentPlanProjects).entries({
  //             ID: p.ID || uuidv4(),
  //             paymentPlan_paymentPlanId: paymentPlanId,
  //             project_projectId: p.project_projectId  // ✅ Already fixed
  //           })
  //         );
  //       }
  //     }

  //     const updated = await db.run(SELECT.one.from(PaymentPlans).where({ paymentPlanId }));
  //     await db.commit();
  //     console.log("✅ PaymentPlan updated:", paymentPlanId);
  //     return updated;

  //   } catch (error) {
  //     await db.rollback();
  //     console.error("❌ Error updating PaymentPlan:", error);
  //     req.error(500, "Error updating PaymentPlan: " + error.message);
  //   }
  // });

  // DELETE
  this.on('DELETE', PaymentPlans, async (req) => {
    const { paymentPlanId } = req.data;
    console.log('DELETE PaymentPlan called for:', paymentPlanId);
    const db = cds.transaction(req);

    try {
      // Delete children first (composition)
      await db.run(DELETE.from(PaymentPlanSchedules).where({ paymentPlan_paymentPlanId: paymentPlanId }));
      await db.run(DELETE.from(PaymentPlanProjects).where({ paymentPlan_paymentPlanId: paymentPlanId }));

      // Delete main plan
      await db.run(DELETE.from(PaymentPlans).where({ paymentPlanId }));
      await db.commit();

      console.log('🗑️ PaymentPlan deleted:', paymentPlanId);
      return { message: `PaymentPlan ${paymentPlanId} deleted.` };

    } catch (error) {
      await db.rollback();
      console.error("❌ Error deleting PaymentPlan:", error);
      req.error(500, "Error deleting PaymentPlan: " + error.message);
    }
  });

  /* ------------------------------------------------------------------
   * VALUE HELP ENTITIES (for dropdowns)
   * ---------------------------Config Screens--------------------------------------- */

  this.on('READ', ConditionTypes, async req => cds.transaction(req).run(req.query));
  this.on('READ', BasePrices, async req => cds.transaction(req).run(req.query));
  this.on('READ', CalculationMethods, async req => cds.transaction(req).run(req.query));
  this.on('READ', Frequencies, async req => cds.transaction(req).run(req.query));
  // 🔹 Add DELETE handlers
  this.on('DELETE', ConditionTypes, async req => {
    const { code } = req.data;
    return await cds.transaction(req).run(
      DELETE.from(ConditionTypes).where({ code })
    );
  });
  this.on('DELETE', BasePrices, async req => {
    const { code } = req.data;
    return await cds.transaction(req).run(
      DELETE.from(BasePrices).where({ code })
    );
  });
  this.on('DELETE', CalculationMethods, async req => {
    const { code } = req.data;
    return await cds.transaction(req).run(
      DELETE.from(CalculationMethods).where({ code })
    );
  });
  this.on('DELETE', Frequencies, async req => {
    const { code } = req.data;
    return await cds.transaction(req).run(
      DELETE.from(Frequencies).where({ code })
    );
  });
  /* ------------------------------------------------------------------
   * DIRECT READ FOR CHILD ENTITIES
   * ------------------------------------------------------------------ */

  this.on('READ', PaymentPlanSchedules, async (req) => {
    console.log('READ PaymentPlanSchedules called');
    return cds.transaction(req).run(req.query);
  });

  this.on('READ', PaymentPlanProjects, async (req) => {
    console.log('READ PaymentPlanProjects called');
    return cds.transaction(req).run(req.query);
  });

  /*----------------------- EOI ---------------------------*/

  // READ
  this.on('READ', EOI, async (req) => {
    console.log('READ EOI called');
    const db = cds.transaction(req);
    return await db.run(req.query);
  });

  // CREATE
  this.on('CREATE', EOI, async (req) => {
    console.log('CREATE EOI called with data:', req.data);
    const db = cds.transaction(req);

    try {
      await db.run(INSERT.into(EOI).entries(req.data));

      const createdEOI = await db.run(
        SELECT.one.from(EOI)
          .where({ eoiId: req.data.eoiId })
          .columns('*', { ref: ['paymentDetails'], expand: ['*'] })
      );

      console.log('Created EOI returned to UI:', createdEOI);
      return createdEOI;
    } catch (error) {
      console.error('Error creating EOI:', error);
      req.error(500, 'Error creating EOI: ' + error.message);
    }
  });

  // UPDATE
  this.on('UPDATE', EOI, async (req) => {
    console.log('UPDATE EOI called with:', req.data, 'params:', req.params);
    const { eoiId } = req.params[0];
    const db = cds.transaction(req);

    try {
      await db.run(UPDATE(EOI).set(req.data).where({ eoiId }));

      const updated = await db.run(
        SELECT.one.from(EOI)
          .where({ eoiId })
          .columns('*', { ref: ['paymentDetails'], expand: ['*'] })
      );

      return updated;
    } catch (error) {
      console.error('Error updating EOI:', error);
      req.error(500, 'Error updating EOI: ' + error.message);
    }
  });

  // DELETE
  this.on('DELETE', EOI, async (req) => {
    console.log('DELETE EOI called for eoiId:', req.data.eoiId);
    const db = cds.transaction(req);
    try {
      return await db.run(DELETE.from(EOI).where({ eoiId: req.data.eoiId }));
    } catch (error) {
      console.error('Error deleting EOI:', error);
      req.error(500, 'Error deleting EOI: ' + error.message);
    }
  });


  /*----------------------- PaymentDetails ---------------------------*/

  // READ
  this.on('READ', PaymentDetails, async (req) => {
    console.log('READ PaymentDetails called');
    const db = cds.transaction(req);
    return await db.run(req.query);
  });

  // CREATE
  this.on('CREATE', PaymentDetails, async (req) => {
    console.log('CREATE PaymentDetails called with data:', req.data);
    const db = cds.transaction(req);

    try {
      const data = req.data;
      data.ID = cds.utils.uuid(); // ensure unique ID

      // handle association to EOI (nested or flat)
      if (req.data.eoi_eoiId) {
        data.eoi_eoiId = req.data.eoi_eoiId;
      } else if (req.data.eoi) {
        data.eoi_eoiId = req.data.eoi.eoiId || req.data.eoi.ID;
      }

      return await db.run(INSERT.into(PaymentDetails).entries(data));
    } catch (error) {
      console.error('Error creating PaymentDetails:', error);
      req.error(500, 'Error creating PaymentDetails');
    }
  });

  // UPDATE
  this.on('UPDATE', PaymentDetails, async (req) => {
    console.log('UPDATE PaymentDetails called with:', req.data, 'params:', req.params);

    const { ID } = req.params[0];
    const db = cds.transaction(req);

    try {
      await db.run(UPDATE(PaymentDetails).set(req.data).where({ ID }));
      const updated = await db.run(SELECT.one.from(PaymentDetails).where({ ID }));
      return updated;
    } catch (error) {
      console.error('Error updating PaymentDetails:', error);
      req.error(500, 'Error updating PaymentDetails: ' + error.message);
    }
  });

  // DELETE
  this.on('DELETE', PaymentDetails, async (req) => {
    console.log('DELETE PaymentDetails called for ID:', req.data.ID);
    const db = cds.transaction(req);
    try {
      return await db.run(DELETE.from(PaymentDetails).where({ ID: req.data.ID }));
    } catch (error) {
      console.error('Error deleting PaymentDetails:', error);
      req.error(500, 'Error deleting PaymentDetails: ' + error.message);
    }
  });

  /*----------------------- Reservations ---------------------------*/



  /** ----------------------------------------------------------------
     *  READ Reservations
     * ---------------------------------------------------------------- */
  this.on("READ", Reservations, async (req) => {
    console.log("READ Reservations called");
    const db = cds.transaction(req);
    return await db.run(req.query);
  });

  // 🔹 Reference Validation Function
  async function validateReferencesForReservations(req, db) {
    const {
      project_projectId,
      building_buildingId,
      unit_unitId,
      paymentPlan_paymentPlanId
    } = req.data;

    const exists = async (entity, key, value) => {
      if (!value) return true;
      const result = await db.run(SELECT.one.from(entity).where({ [key]: value }));
      return !!result;
    };

    if (project_projectId && !(await exists("Projects", "projectId", project_projectId))) {
      req.error(400, `Project ID '${project_projectId}' not found`);
    }
    if (building_buildingId && !(await exists("Buildings", "buildingId", building_buildingId))) {
      req.error(400, `Building ID '${building_buildingId}' not found`);
    }
    if (unit_unitId && !(await exists("Units", "unitId", unit_unitId))) {
      req.error(400, `Unit ID '${unit_unitId}' not found`);
    }
    if (paymentPlan_paymentPlanId && !(await exists("PaymentPlans", "paymentPlanId", paymentPlan_paymentPlanId))) {
      req.error(400, `Payment Plan ID '${paymentPlan_paymentPlanId}' not found`);
    }

    return true;
  }

  // 🔹 CREATE Reservation
  this.on("CREATE", Reservations, async (req) => {
    const db = cds.transaction(req);
    const reservationData = { ...req.data };

    // Auto-generate UUID if not provided
    reservationData.reservationId = reservationData.reservationId || uuidv4();

    // Extract child collections
    const { partners, conditions, payments } = reservationData;
    delete reservationData.partners;
    delete reservationData.conditions;
    delete reservationData.payments;

    try {
      // ✅ Validate foreign key references before inserting
      await validateReferencesForReservations(req, db);

      console.log("🔹 Creating reservation:", reservationData);

      // Insert main reservation
      await db.run(INSERT.into(Reservations).entries(reservationData));

      // Insert partners
      if (partners?.length) {
        await Promise.all(
          partners.map((p) =>
            db.run(
              INSERT.into(ReservationPartners).entries({
                ...p,
                reservation_ID: reservationData.reservationId,
              })
            )
          )
        );
      }

      // Insert conditions
      if (conditions?.length) {
        await Promise.all(
          conditions.map((c) =>
            db.run(
              INSERT.into(ReservationConditions).entries({
                ...c,
                reservation_ID: reservationData.reservationId,
              })
            )
          )
        );
      }

      // Insert payments
      if (payments?.length) {
        await Promise.all(
          payments.map((pay) =>
            db.run(
              INSERT.into(ReservationPayments).entries({
                ...pay,
                reservation_ID: reservationData.reservationId,
              })
            )
          )
        );
      }

      console.log("✅ Reservation created successfully:", reservationData.reservationId);
      return reservationData;

    } catch (error) {
      console.error("❌ Error creating Reservation:", error);
      req.error(500, "Error creating Reservation: " + error.message);
    }
  });



  /** ----------------------------------------------------------------
   *  UPDATE Reservation
   * ---------------------------------------------------------------- */
  this.on("UPDATE", Reservations, async (req) => {
    console.log("UPDATE Reservation called:", req.data);
    const { reservationId } = req.params[0];
    const db = cds.transaction(req);

    try {
      await validateReferencesForReservations(req, db);

      await db.run(UPDATE(Reservations).set(req.data).where({ reservationId }));
      const updated = await db.run(SELECT.one.from(Reservations).where({ reservationId }));
      await db.commit();
      console.log("✅ Reservation updated:", reservationId);
      return updated;

    } catch (error) {
      await db.rollback();
      console.error("❌ Error updating Reservation:", error);
      req.error(500, "Error updating Reservation: " + error.message);
    }
  });

  /** ----------------------------------------------------------------
   *  DELETE Reservation
   * ---------------------------------------------------------------- */
  this.on("DELETE", Reservations, async (req) => {
    console.log("DELETE Reservation called for:", req.data.reservationId);
    const db = cds.transaction(req);

    try {
      const { reservationId } = req.data;
      await db.run(DELETE.from(Reservations).where({ reservationId }));
      await db.commit();
      console.log("🗑️ Reservation deleted:", reservationId);
      return { message: `Reservation ${reservationId} deleted.` };
    } catch (error) {
      await db.rollback();
      console.error("❌ Error deleting Reservation:", error);
      req.error(500, "Error deleting Reservation: " + error.message);
    }
  });

  /*---------------------Simulations-----------------------*/
  // 🔹 Add handlers for PaymentPlanSimulations
this.on('READ', PaymentPlanSimulations, async req => cds.transaction(req).run(req.query));

this.on('CREATE', PaymentPlanSimulations, async req => {
  const data = req.data;

  // For deep inserts (e.g., via /Units('U0001')/simulations), get unitId from req.params
  // req.params[0] contains the parent entity keys (e.g., { unitId: 'U0001' })
  const unitId = req.params[0]?.unitId;

  // If unitId is not available from params (e.g., direct insert), fall back to data.unitId
  const effectiveUnitId = unitId || data.unitId;

  if (!effectiveUnitId) {
    req.reject(400, 'Unit ID is required for creating a simulation.');
    return;
  }

  // Transform unitId into the unit association only if unitId was provided in data (for direct inserts)
  if (data.unitId && !unitId) {  // Only if not a deep insert
    data.unit = { unitId: data.unitId };
    delete data.unitId;  // Remove the direct field to avoid insertion errors
  }

  // Check for existing simulation with the same unit and pricePlanYears
  // Use the foreign key field name 'unit_unitId' as seen in the response data
  const existingSimulation = await cds.transaction(req).run(
    SELECT.from(PaymentPlanSimulations)
      .where({
        unit_unitId: effectiveUnitId,
        pricePlanYears: data.pricePlanYears
      })
  );

  if (existingSimulation.length > 0) {
    req.reject(400, `A simulation with pricePlanYears ${data.pricePlanYears} already exists for this unit.`);
    return;  // Exit early to prevent insertion
  }

  // Handle deep insert for schedule (ensure only required fields are included)
  if (data.schedule) {
    data.schedule = data.schedule.map(s => ({
      conditionType: s.conditionType,
      dueDate: s.dueDate,
      amount: s.amount,
      maintenance: s.maintenance
    }));
  }

  return await cds.transaction(req).run(
    INSERT.into(PaymentPlanSimulations).entries(data)
  );
});



///////////////////////////RE-CONTRACTS/////////////////////////

 // ------------------- READ / GET -------------------
    this.on('READ', RealEstateContracts, async (req) => {
        try {
            // Connect to the S/4 API via BTP destination
            const s4Service = await cds.connect.to('BTP_REAL_ESTATE_RE_CONTRACT');
            
            // Forward the request/query to S/4
            return s4Service.tx(req).run(req.query);

        } catch (error) {
            console.error("Error fetching Real Estate Contracts:", error);
            req.reject(500, "Failed to fetch Real Estate Contracts");
        }
    });

});